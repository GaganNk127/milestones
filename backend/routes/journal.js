const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// Save journal entry
router.post('/entry', auth, async (req, res) => {
    const { entry } = req.body;

    try {
        const userId = req.user.userId;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if entry exists for today
        const existingEntry = await JournalEntry.findOne({ userId, date: today });

        if (existingEntry) {
            return res.status(400).send('Journal entry for today already exists.');
        }

        const journalEntry = new JournalEntry({ userId, entry, date: today });
        await journalEntry.save();
        res.status(201).send('Journal entry saved');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get journal entries
router.get('/entry', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const journalEntries = await JournalEntry.find({ userId }).sort({ createdAt: -1 });

        if (!journalEntries.length) {
            return res.status(404).send('No journal entries found for this user');
        }

        res.status(200).json(journalEntries);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
