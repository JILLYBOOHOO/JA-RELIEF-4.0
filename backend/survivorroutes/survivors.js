const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // ensure "uploads" folder exists in backend
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
});

// Middleware to handle validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register survivor
router.post('/register', 
  upload.single('idScan'),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('contact').notEmpty().withMessage('Contact is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validateResults,
  async (req, res, next) => {
    try {
      let {
        fullName, contact, idType, idNumber, provisional,
        parish, address, dob, damageLevel, password,
        weight, emergencyContact, bloodType, currentMedications, 
        medicalConditions, allergies, preferredDoctorName, doctorContactNumber
      } = req.body;

      // Password complexity check
      const commonSequences = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'password'];
      const isSimplePwd = commonSequences.some(seq => password.toLowerCase().includes(seq)) || /(.)\1\1/.test(password);
      if (isSimplePwd) {
          return res.status(400).json({ error: 'Password is too common or contains repetitive characters.' });
      }

      const isSimpleId = commonSequences.some(seq => idNumber && idNumber.toLowerCase().includes(seq)) || (idNumber && /(.)\1\1/.test(idNumber));
      if (isSimpleId) {
          return res.status(400).json({ error: 'ID Number cannot be a simple sequence like 1234 or aaaa.' });
      }

      // Handle FormData converting booleans to strings
      const isProvisional = provisional === 'true' || provisional === true || provisional === 1 || provisional === '1';

      if (!isProvisional && !idNumber) {
         return res.status(400).json({ error: 'ID Number is required when not requesting provisional access.' });
      }

      // If provisional and no ID provided, give a unique placeholder to prevent DB overlap
      if (isProvisional && (!idNumber || idNumber.trim() === '')) {
         idNumber = 'PROV-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      }

      const idScanPath = req.file ? req.file.filename : null;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { generateCardNumber, getInitialBalance } = require('../utils/card.util');
      const cardNumber = generateCardNumber();
      const balance = getInitialBalance(damageLevel);

      const sql = `
        INSERT INTO survivors
        (fullName, contact, idType, idNumber, provisional, parish, address, dob, damageLevel, password, idScanPath, 
         weight, emergencyContact, bloodType, currentMedications, medicalConditions, allergies, preferredDoctorName, doctorContactNumber, cardNumber, balance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        fullName, contact, idType, idNumber, isProvisional, 
        parish, address, dob, damageLevel, hashedPassword, idScanPath,
        weight, emergencyContact, bloodType, currentMedications, medicalConditions, allergies, preferredDoctorName, doctorContactNumber,
        cardNumber, balance
      ]);

      res.status(201).json({ message: 'Survivor registered successfully', survivorId: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Registration failed', error: 'This ID Number is already registered.' });
      }
      next(err); // pass to global error handler
    }
  }
);

// Login survivor or admin
router.post('/login', [
  body('identifier').notEmpty().withMessage('Login Identifier is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validateResults, async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

    // First check if an admin matches (admin still uses ID number)
    const [adminRows] = await db.query('SELECT * FROM admins WHERE idNumber = ?', [identifier]);
    if (adminRows.length > 0) {
      const admin = adminRows[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const token = jwt.sign(
        { id: admin.id, idNumber: admin.idNumber, role: 'admin' },
        jwtSecret,
        { expiresIn: '8h' }
      );

      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: admin.id,
          name: 'Administrator',
          idNumber: admin.idNumber,
          role: 'admin'
        }
      });
    }

    // Otherwise, check survivors (allow login by Full Name, Contact, or old ID number fallback)
    const [rows] = await db.query('SELECT * FROM survivors WHERE fullName = ? OR contact = ? OR idNumber = ?', [identifier, identifier, identifier]);
    if (rows.length === 0) {
      return res.status(401).json({ error: `Account not found with provided identifier '${identifier}'. Please check your spelling or register.` });
    }

    const survivor = rows[0];
    const isMatch = await bcrypt.compare(password, survivor.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { id: survivor.id, idNumber: survivor.idNumber, role: 'survivor' },
      jwtSecret,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: survivor.id,
        name: survivor.fullName,
        idNumber: survivor.idNumber,
        role: 'survivor',
        dob: survivor.dob,
        weight: survivor.weight,
        emergencyContact: survivor.emergencyContact,
        bloodType: survivor.bloodType,
        currentMedications: survivor.currentMedications,
        medicalConditions: survivor.medicalConditions,
        allergies: survivor.allergies,
        preferredDoctorName: survivor.preferredDoctorName,
        doctorContactNumber: survivor.doctorContactNumber
      }
    });

  } catch (err) {
    next(err);
  }
});

// Reset Password (Mock flow)
router.post('/reset-password', [
  body('identifier').notEmpty().withMessage('Identifier is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], validateResults, async (req, res, next) => {
  try {
    const { identifier, newPassword } = req.body;
    
    // Check survivors to see if one matches the identifier
    const [rows] = await db.query('SELECT * FROM survivors WHERE fullName = ? OR contact = ? OR idNumber = ?', [identifier, identifier, identifier]);
    if (rows.length === 0) {
      // Don't leak whether the account exists or not in a real system, but for now we'll throw an error
      return res.status(404).json({ error: 'Account not found. Please check your spelling.' });
    }

    const survivor = rows[0];
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE survivors SET password = ? WHERE id = ?', [hashedPassword, survivor.id]);

    res.json({ message: 'Password successfully reset' });

  } catch (err) {
    next(err);
  }
});

module.exports = router;

