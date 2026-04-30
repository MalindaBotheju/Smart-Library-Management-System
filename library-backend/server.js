// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); 
const cron = require('node-cron'); // <-- 1. IMPORT NODE-CRON HERE

const app = express();

// --- MIDDLEWARE ---
// This opens the bridge so your React app (Port 5173) can talk to this Backend (Port 5000)
app.use(cors()); 
app.use(express.json());

// --- ROUTES ---
const bookRoutes = require('./routes/books');
const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');

app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Library Backend is running perfectly!');
});

// --- AUTOMATED BACKGROUND JOB: CLEAR EXPIRED RESERVATIONS ---
// <-- 2. ADD THE TIMER LOGIC HERE
// This timer runs automatically at the top of every single hour (e.g., 1:00, 2:00, 3:00)
cron.schedule('0 * * * *', async () => {
  try {
    // 1. Find all reservations where 48 hours have officially passed
    const expiredReservations = await pool.query(`
      SELECT id, book_id 
      FROM loans 
      WHERE status = 'reserved' 
      AND reserved_at <= CURRENT_TIMESTAMP - INTERVAL '48 hours'
    `);

    // 2. If it found any, loop through them and fix the database
    if (expiredReservations.rows.length > 0) {
      for (let loan of expiredReservations.rows) {
        
        // A) Add the copy back to the books table so others can borrow it
        await pool.query(
          'UPDATE books SET available_copies = available_copies + 1 WHERE id = $1', 
          [loan.book_id]
        );
        
        // B) Delete the expired reservation entirely so it stops cluttering your dashboard
        await pool.query('DELETE FROM loans WHERE id = $1', [loan.id]);
      }
      
      console.log(`⏰ Cron Job: Automatically cleared ${expiredReservations.rows.length} expired reservations.`);
    }
  } catch (error) {
    console.error("Error running the reservation cleanup job:", error);
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is awake on http://localhost:${PORT}`);
});