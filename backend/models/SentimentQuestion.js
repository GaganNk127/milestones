// models/SentimentQuestion.js
const mongoose = require('mongoose');

const SentimentQuestionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    labels: {
        label1: { type: String, required: true },
        label2: { type: String, required: true },
        label3: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SentimentQuestion', SentimentQuestionSchema);
