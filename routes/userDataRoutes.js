const express = require('express');
const User = require('../models/User'); // Import User model
const router = express.Router();
const authenticateToken = require('../tokenization/AuthenticationToken');
const UserData = require('../models/UserData');


// POST route to create a user
router.post('/uploadData', authenticateToken, async (req, res) => {
  // const { email, username, password } = req.body;
  const {username, imageURL, note} = req.body;

  try {
    // const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    const existingUser = await User.find({username})
    if (!existingUser) {
      return res.status(404).json({ error: 'Username not found!' });
    }

    const newUserData = new UserData({username, imageURL, note})
    const savedUserData = await newUserData.save();

    res.status(201).json({ message: 'User data saved successfully', data: { username: savedUserData.username, imageURL: savedUserData.imageURL, note: savedUserData.note, date: savedUserData.date }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

module.exports = router;
