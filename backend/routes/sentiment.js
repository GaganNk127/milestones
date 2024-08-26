const express = require("express");
const NegativeSentiment = require("../models/NegativeSentiment");
const User = require("../models/User");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");

const router = express.Router();

// Save negative sentiment
router.post("/negative", auth, async (req, res) => {
  const { responses } = req.body;
  console.log("Received responses:", responses);

  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if sentiment entry already exists for today
    const existingEntry = await NegativeSentiment.findOne({ userId, date: today });
     if (existingEntry) {
      return res.status(400).send("Sentiment entry for today already exists.");
    }

    // Save new sentiment entry
    const sentiment = new NegativeSentiment({
      userId,
      responses,
      date: today, // Ensure date is set when saving the sentiment
    });
    await sentiment.save();
    console.log("Sentiment saved");

    // Fetch user details from the 'users' collection
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }


    res.status(201).send("Sentiment saved"); // Moved outside the transporter condition
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
