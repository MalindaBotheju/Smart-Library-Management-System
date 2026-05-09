const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');

// POST: Borrow a book
router.post('/', async (req, res) => {
  try {
    // This will now automatically save the borrowDate and dueDate sent from React
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    
    // Automatically decrease the number of AVAILABLE copies in the Book database
    const book = await Book.findById(req.body.bookId);
    if (book && book.availableCopies > 0) {
      book.availableCopies -= 1; // ONLY reduce available copies
      if (book.availableCopies === 0) book.isAvailable = false; // Mark unavailable if 0 left
      await book.save();
    }

    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET: Fetch all borrowing history
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ borrowDate: -1 }); // Newest first
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Return a book and calculate fine
router.put('/:id/return', async (req, res) => {
  try {
    // 1. Find the existing transaction to get the original due date
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // 2. Set up dates for calculation
    const dueDate = new Date(transaction.dueDate);
    const returnDate = new Date(req.body.actualReturnDate);
    
    // 3. Calculate Fine (Set your daily rate here!)
    let calculatedFine = 0;
    const dailyRate = 10; // e.g., 10 rupees per day

    if (returnDate > dueDate) {
      // Calculate the difference in milliseconds, then convert to whole days
      const diffInTime = returnDate.getTime() - dueDate.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24)); 
      
      calculatedFine = diffInDays * dailyRate;
    }

    // 4. Update the transaction with the new status, date, AND the fine
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id, 
      { 
        status: req.body.status, 
        actualReturnDate: req.body.actualReturnDate,
        fine: calculatedFine 
      }, 
      { new: true }
    );

    // 5. Add a copy back to the AVAILABLE Book Inventory
    if (updatedTransaction) {
      const book = await Book.findById(updatedTransaction.bookId);
      if (book) {
        book.availableCopies += 1; // ONLY increase available copies
        book.isAvailable = true;
        await book.save();
      }
    }

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;