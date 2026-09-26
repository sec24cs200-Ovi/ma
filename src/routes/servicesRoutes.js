const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * POST /api/schemes/apply
 * Submits a new government grant or educational scholarship application
 */
router.post('/apply', (req, res) => {
  const {
    applicantName = 'K. Rameshan',
    vesselId = 'IND-TN-10-MM-4421',
    schemeName = "Fishermen's E-Grantz Educational Scholarship Scheme",
    studentName,
    courseLevel = 'B.Sc Marine Biology / Fisheries Science',
    aadhaar = 'XXXX-XXXX-4892',
    bankDetails = 'SBI Rameswaram (SBIN0000912) - Ac: ***4410'
  } = req.body;

  const refId = `PMMSY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const application = {
    id: refId,
    submittedAt: new Date().toISOString(),
    applicantName,
    vesselId,
    schemeName,
    studentName: studentName || applicantName,
    courseLevel,
    aadhaar,
    bankDetails,
    status: 'SUBMITTED_FAST_TRACK',
    approvalStage: 'Stage 1: Biometric Verification & Coastal Aadhaar DBT Linked'
  };

  db.insert('scheme_applications', application);

  res.json({
    success: true,
    message: `Application submitted successfully to Ministry of Fisheries portal. Reference: ${refId}`,
    application
  });
});

/**
 * GET /api/schemes/applications
 * Returns all submitted scheme applications
 */
router.get('/applications', (req, res) => {
  const apps = db.get('scheme_applications');
  res.json({
    success: true,
    total: apps.length,
    applications: apps
  });
});

/**
 * POST /api/market/quote
 * Dispatches fresh catch quotation to local harbor buyer or resort restaurant
 */
router.post('/quote', (req, res) => {
  const {
    buyer = 'Ocean View Resort & Seafood Restaurant',
    chef = 'Anand Kumar',
    catchOffer = 'Grade-A Vanjaram (Seerfish) - 30kg @ ₹680/kg',
    vesselId = 'IND-TN-10-MM-4421'
  } = req.body;

  const quote = {
    id: `QT-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    vesselId,
    buyer,
    chef,
    catchOffer,
    status: 'DISPATCHED_TO_BUYER_RADIO',
    channel: 'Harbor VHF Direct Gateway'
  };

  db.insert('market_quotes', quote);

  res.json({
    success: true,
    message: `Quotation dispatched to ${buyer} (${chef}). Awaiting morning jetty inspection.`,
    quote
  });
});

/**
 * GET /api/market/quotes
 * Returns submitted market quotations
 */
router.get('/quotes', (req, res) => {
  const quotes = db.get('market_quotes');
  res.json({
    success: true,
    total: quotes.length,
    quotes
  });
});

module.exports = router;
