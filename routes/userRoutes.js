const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Import User model
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = require('../tokenization/AuthenticationToken');


const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';



// POST route to create a user
router.post('/create', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email or Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, username, password: hashedPassword });
    const savedUser = await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: { email: savedUser.email, username: savedUser.username }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST route for login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Compare the hashed password with the input password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Return success message (you can add JWT token here later)
    const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', user: { username: user.username, }, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/getUsers', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, {_id:0,  password: 0, __v: 0}); // Exclude passwords
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
