const mongoose = require('mongoose');

const negativeSentimentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    responses: {
        type: Object,
        required: true
    },
    label:{
        type:String
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NegativeSentiment', negativeSentimentSchema);
