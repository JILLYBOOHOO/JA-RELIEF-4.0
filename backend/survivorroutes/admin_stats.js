const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all dashboard stats
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    // 1. Total Monetary Donation Sum
    const [monetaryRows] = await db.query('SELECT SUM(amount) as total FROM monetary_donations');
    const totalMonetary = monetaryRows[0].total || 0;

    // 2. Recent Pledges (Kind)
    const [pledgeRows] = await db.query('SELECT * FROM pledge_donations ORDER BY createdAt DESC LIMIT 10');

    // 3. Survivor Requests
    const [survivorRows] = await db.query('SELECT fullName, contact, parish, idNumber, createdAt FROM survivors ORDER BY createdAt DESC LIMIT 10');

    // 4. Pantry Inventory (Simulated for this exercise, but fetching count of item types)
    // In a real app we'd have an inventory table
    const [pantryRows] = await db.query('SELECT COUNT(*) as itemCount FROM survivors'); // Just as a placeholder

    res.json({
      monetary: { total: totalMonetary },
      pledges: pledgeRows,
      survivors: survivorRows,
      inventoryCount: pantryRows[0].itemCount
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
