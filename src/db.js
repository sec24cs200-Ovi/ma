/**
 * Marine AI - Embedded JSON Database Engine
 * Persistent, zero-maintenance storage for telemetry, emergency logs,
 * scheduler configurations, scheme applications, and AI reasoning history.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const SEED_DATA = {
  emergency_sos: [
    {
      id: 'SOS-INIT-001',
      timestamp: new Date().toISOString(),
      vesselId: 'IND-TN-10-MM-4421',
      captain: 'K. Rameshan',
      phone: '+91 81225 66828',
      coords: '09.2876° N, 79.3129° E',
      mapsLink: 'https://maps.google.com/?q=09.2876,79.3129',
      status: 'DELIVERED',
      network: 'NavIC Satellite & SMS Gateway',
      ack: true
    }
  ],
  family_scheduler: {
    frequency: '1hour',
    lastPing: new Date().toISOString(),
    contacts: [
      { role: 'Given Emergency Mobile', name: 'Emergency Contact', phone: '+91 81225 66828', channel: 'Direct In-App Satellite & SMS', status: 'SYNCED' },
      { role: 'Father', name: 'M. Karuppan', phone: '+91 98401 23456', channel: 'SMS + Relay', status: 'SYNCED' },
      { role: 'Mother', name: 'K. Lakshmi', phone: '+91 98402 34567', channel: 'SMS + Relay', status: 'SYNCED' },
      { role: 'Spouse', name: 'R. Selvi', phone: '+91 94432 78901', channel: 'WhatsApp + SMS', status: 'SYNCED' }
    ],
    logs: [
      { time: '14:00 PM', coords: '09.2876° N, 79.3129° E', note: 'Delivered to Parents & Spouse (SMS/WhatsApp)' },
      { time: '13:00 PM', coords: '09.2541° N, 79.2883° E', note: 'Delivered to Parents & Spouse (SMS/WhatsApp)' }
    ]
  },
  smartnet_telemetry: [
    { timestamp: new Date().toISOString(), load_kg: 245.0, tension_kn: 2.40, stress_percent: 49, tangle_risk: 'LOW' }
  ],
  scheme_applications: [
    {
      id: 'SCH-2026-8891',
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      applicantName: 'K. Rameshan',
      vesselId: 'IND-TN-10-MM-4421',
      schemeName: "Fishermen's E-Grantz Educational Scholarship Scheme",
      studentName: 'R. Karthik (Son)',
      courseLevel: 'B.Sc Marine Biology / Fisheries Science',
      aadhaar: 'XXXX-XXXX-4892',
      bankDetails: 'SBI Rameswaram (SBIN0000912) - Ac: ***4410',
      status: 'VERIFIED_BY_DOF',
      approvalStage: 'Stage 2: District Fisheries Officer Sanction'
    }
  ],
  market_quotes: [
    {
      id: 'QUOTE-01',
      submittedAt: new Date().toISOString(),
      vesselId: 'IND-TN-10-MM-4421',
      buyer: 'Ocean View Resort & Seafood Restaurant',
      chef: 'Anand Kumar',
      catchOffer: 'Grade-A Vanjaram (Seerfish) - 30kg @ ₹680/kg',
      status: 'ACCEPTED_PENDING_INSPECTION'
    }
  ],
  ai_queries: [
    {
      timestamp: new Date().toISOString(),
      query: 'Is it safe to go to sea tomorrow morning?',
      recommendation: 'SAFE TO SAIL (Optimal Fishing Window: 04:00 AM - 11:30 AM)',
      confidence: '96%',
      region: 'rameswaram'
    }
  ]
};

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection(collection) {
  const filePath = getFilePath(collection);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    // Seed initial data if file doesn't exist
    const initial = SEED_DATA[collection] || [];
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  } catch (err) {
    console.error(`[DB Error] Reading collection ${collection}:`, err.message);
    return SEED_DATA[collection] || [];
  }
}

function writeCollection(collection, data) {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[DB Error] Writing collection ${collection}:`, err.message);
    return false;
  }
}

const db = {
  get(collection) {
    return readCollection(collection);
  },

  insert(collection, item) {
    const data = readCollection(collection);
    if (Array.isArray(data)) {
      data.unshift(item);
      writeCollection(collection, data);
      return item;
    } else {
      // For object collections like family_scheduler
      const updated = { ...data, ...item };
      writeCollection(collection, updated);
      return updated;
    }
  },

  find(collection, filterFn) {
    const data = readCollection(collection);
    if (!Array.isArray(data)) return [];
    return data.filter(filterFn);
  },

  update(collection, filterFn, updateFn) {
    const data = readCollection(collection);
    if (Array.isArray(data)) {
      let modifiedCount = 0;
      const updated = data.map(item => {
        if (filterFn(item)) {
          modifiedCount++;
          return updateFn(item);
        }
        return item;
      });
      writeCollection(collection, updated);
      return { modifiedCount };
    } else {
      const updated = updateFn(data);
      writeCollection(collection, updated);
      return { modifiedCount: 1 };
    }
  }
};

module.exports = db;
