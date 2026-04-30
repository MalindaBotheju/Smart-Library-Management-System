// routes/books.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Go up one folder to find db.js

// 1. ADD A NEW BOOK (POST)
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, total_copies, image_url, genre, daily_fine_rate } = req.body;
    
    const rate = daily_fine_rate || 1.00; // Default to $1.00 if empty

    const newBook = await pool.query(
      'INSERT INTO books (title, author, isbn, total_copies, available_copies, image_url, genre, daily_fine_rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, author, isbn, total_copies, total_copies, image_url, genre, rate]
    );

    res.status(201).json({ message: 'Book added successfully!', book: newBook.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to add the book' });
  }
});

// 2. VIEW ALL BOOKS (GET)
router.get('/', async (req, res) => {
  try {
    const allBooks = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.status(200).json(allBooks.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// UPDATE an existing book (Admin Action)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, total_copies, image_url, genre, daily_fine_rate } = req.body;
    
    const currentBook = await pool.query('SELECT total_copies, available_copies FROM books WHERE id = $1', [id]);
    if (currentBook.rows.length === 0) return res.status(404).json({ error: 'Book not found' });

    const oldTotal = currentBook.rows[0].total_copies;
    const oldAvailable = currentBook.rows[0].available_copies;
    
    const difference = parseInt(total_copies) - oldTotal;
    const newAvailable = oldAvailable + difference;

    const rate = daily_fine_rate || 1.00;

    // Added daily_fine_rate as $8, shifting id to $9
    const updateQuery = `
      UPDATE books 
      SET title = $1, author = $2, isbn = $3, total_copies = $4, available_copies = $5, image_url = $6, genre = $7, daily_fine_rate = $8
      WHERE id = $9 
      RETURNING *
    `;
    
    const updatedBook = await pool.query(updateQuery, [title, author, isbn, total_copies, newAvailable, image_url, genre, rate, id]);
    
    res.status(200).json({ message: 'Book updated successfully!', book: updatedBook.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error updating book' });
  }
});

// DELETE a book (Admin Action)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Safety Check: Is the book currently reserved or borrowed?
    const activeLoans = await pool.query(
      "SELECT * FROM loans WHERE book_id = $1 AND status IN ('reserved', 'borrowed')",
      [id]
    );

    if (activeLoans.rows.length > 0) {
      // If yes, block the deletion completely!
      return res.status(400).json({ error: 'Cannot delete: This book is currently reserved or borrowed.' });
    }

    // 2. Clear out old "returned" history for this book so the database Foreign Key constraints don't crash
    await pool.query('DELETE FROM loans WHERE book_id = $1', [id]);

    // 3. Finally, delete the book itself
    await pool.query('DELETE FROM books WHERE id = $1', [id]);

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error deleting book' });
  }
});

module.exports = router;