const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, sparse: true }, // sparse allows optional unique values
  genre: { type: String },              // NEW: Genre
  copies: { type: Number, default: 1 }, // NEW: Number of copies
  availableCopies: { type: Number, default: 1 },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true }
}, { 
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' dates
});

// Export the model so we can use it in other files
module.exports = mongoose.model('Book', bookSchema);