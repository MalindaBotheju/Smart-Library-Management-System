const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitle: { type: String, required: true },
  borrowerName: { type: String, required: true },
  
  // The dates sent from your React frontend
  borrowDate: { type: Date, required: true },
  dueDate: { type: Date, required: true }, 
  actualReturnDate: { type: Date },
  
  // Status to track if it is still borrowed or returned
  status: { type: String, default: 'Borrowed' },
  // Add this inside your transactionSchema
  fine: { type: Number, default: 0 }
});

module.exports = mongoose.model('Transaction', transactionSchema);