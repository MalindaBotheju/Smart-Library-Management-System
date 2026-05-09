const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// POST: Register a new user and auto-login
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Save to database
    const newUser = new User({ 
      username, 
      email, // Now storing the required email
      password: hashedPassword 
    });
    
    await newUser.save();
    
    // 4. Auto-Login logic
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ 
      token, 
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role } 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Login user (Changed to Email-based login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Logic now expects email
    
    // 1. Find user by email instead of username
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found with this email' });

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // 3. Create a token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // 4. Send back the token and user details
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;