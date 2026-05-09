const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {       
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // Crucial for real-world: prevents duplicate accounts with different casing
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'] // Backend validation
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'], // Changed 'member' to 'student' to match library context
    default: 'student' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);