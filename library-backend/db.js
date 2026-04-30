// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// CHANGED: Added 'client' and 'release' to the parameters here
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Successfully connected to Neon Database!');
    release(); // <--- THE MAGIC FIX: This safely closes the initial test connection
  }
});

// --- ADD THIS NEW BLOCK ---
// This catches unexpected dropouts from Neon so your server doesn't crash!
pool.on('error', (err, client) => {
  console.error('Unexpected database error (connection dropped by Neon):', err.message);
});
// --------------------------

module.exports = pool;