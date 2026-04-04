const express = require('express');
const router = express.Router();
const db = require('../db');

// Record a new monetary donation
router.post('/monetary', async (req, res, next) => {
  try {
    const { amount, donorName, donorPhone, donorEmail } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO monetary_donations (amount, donorName, donorPhone, donorEmail) VALUES (?, ?, ?, ?)',
      [amount, donorName, donorPhone, donorEmail]
    );
    
    res.status(201).json({ message: 'Donation recorded', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Record an in-kind donation (pledge)
router.post('/pledge', async (req, res, next) => {
  try {
    const { donorName, donorPhone, donorEmail, items, center, dropOffDate } = req.body;
    
    // items is an array of strings, we'll store it as JSON string
    const [result] = await db.query(
      'INSERT INTO pledge_donations (donorName, donorPhone, donorEmail, items, center, dropOffDate) VALUES (?, ?, ?, ?, ?, ?)',
      [donorName, donorPhone, donorEmail, JSON.stringify(items), center, dropOffDate]
    );
    
    res.status(201).json({ message: 'Pledge recorded', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
