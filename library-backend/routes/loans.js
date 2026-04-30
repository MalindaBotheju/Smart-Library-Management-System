// routes/loans.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. RESERVE A BOOK (User Action)
router.post('/reserve', async (req, res) => {
  try {
    const { user_id, book_id } = req.body;

    // First, check if the book is actually available
    const bookCheck = await pool.query('SELECT available_copies FROM books WHERE id = $1', [book_id]);
    if (bookCheck.rows.length === 0 || bookCheck.rows[0].available_copies <= 0) {
      return res.status(400).json({ error: 'Sorry, no copies are currently available.' });
    }

    // Create the loan record with a 'reserved' status
    const newLoan = await pool.query(
      "INSERT INTO loans (user_id, book_id, status) VALUES ($1, $2, 'reserved') RETURNING *",
      [user_id, book_id]
    );

    // Deduct 1 from the available copies in the books table
    await pool.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = $1', [book_id]);

    res.status(201).json({ message: 'Book reserved successfully!', loan: newLoan.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error during reservation' });
  }
});

// 2. CHECKOUT A BOOK (Admin Action)
router.put('/checkout/:id', async (req, res) => {
  try {
    const loanId = req.params.id; // The ID of the specific loan

    // Change status to 'borrowed' and set the due date to 14 days from exactly right now
    const updatedLoan = await pool.query(
      `UPDATE loans 
       SET status = 'borrowed', 
           borrow_date = CURRENT_TIMESTAMP, 
           due_date = CURRENT_TIMESTAMP + INTERVAL '14 days' 
       WHERE id = $1 RETURNING *`,
      [loanId]
    );

    res.status(200).json({ message: 'Book checked out to user!', loan: updatedLoan.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error during checkout' });
  }
});

// 3. RETURN A BOOK (Admin Action)
router.put('/return/:id', async (req, res) => {
  try {
    const loanId = req.params.id;

    // Fetch the loan AND join the books table to get the specific daily_fine_rate
    const loanResult = await pool.query(`
      SELECT loans.*, books.daily_fine_rate 
      FROM loans 
      JOIN books ON loans.book_id = books.id 
      WHERE loans.id = $1
    `, [loanId]);
    
    const loan = loanResult.rows[0];
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // Use the book's specific rate (fallback to 1.00 just in case)
    const fineRate = loan.daily_fine_rate || 1.00;

    // Mark as returned and calculate fine using the dynamic fineRate ($2)
    const returnUpdate = await pool.query(
      `UPDATE loans 
       SET status = 'returned', 
           return_date = CURRENT_TIMESTAMP,
           fine_amount = GREATEST(0, EXTRACT(DAY FROM (CURRENT_TIMESTAMP - due_date)) * $2)
       WHERE id = $1 RETURNING *`,
      [loanId, fineRate]
    );

    // Add 1 back to the available copies
    await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = $1', [loan.book_id]);

    res.status(200).json({ message: 'Book returned successfully!', loan: returnUpdate.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error during return' });
  }
});

// 4. VIEW ALL LOANS (Admin Action)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT loans.id, loans.status, loans.borrow_date, loans.due_date, 
             users.name AS user_name, books.title AS book_title
      FROM loans
      JOIN users ON loans.user_id = users.id
      JOIN books ON loans.book_id = books.id
      ORDER BY loans.id DESC
    `;
    const allLoans = await pool.query(query);
    res.status(200).json(allLoans.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching loans' });
  }
});

// 5. VIEW A USER'S LOANS (User Action)
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Join with books to get the title and author
    const query = `
      SELECT loans.id, loans.status, loans.borrow_date, loans.due_date, 
             books.title AS book_title, books.author
      FROM loans
      JOIN books ON loans.book_id = books.id
      WHERE loans.user_id = $1
      ORDER BY loans.id DESC
    `;
    const userLoans = await pool.query(query, [userId]);
    res.status(200).json(userLoans.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching user loans' });
  }
});

module.exports = router;