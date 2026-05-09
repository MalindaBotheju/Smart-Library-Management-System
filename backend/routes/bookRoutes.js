const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// POST: Add a new book to the library
router.post('/', async (req, res) => {
  try {
    // We intercept the request body and set availableCopies to equal total copies
    const bookData = {
      ...req.body,
      availableCopies: req.body.copies || 1
    };

    const newBook = new Book(bookData);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET: Fetch all books from the library
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE a book
router.put('/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a book (with protection)
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if any copies are currently borrowed
    const borrowedCount = book.copies - book.availableCopies;
    if (borrowedCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete book. ${borrowedCount} copy/copies are currently borrowed.` 
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;