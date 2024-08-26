const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

// Middleware
app.use(cors({
  origin: "*", 
  allowedHeaders:"*",
  methods:"*"
}));

// Routes
const authRoutes = require('./routes/auth');
const journalRoutes = require('./routes/journal');
const sentimentRoutes = require('./routes/sentiment');
const questionRoutes = require('./routes/question');

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/sentiment',questionRoutes );


async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb+srv://gagannaik127:cMNsRylUKzjupWyg@cluster0.azoclvh.mongodb.net/Mentamilestone01?retryWrites=true&w=majority&appName=Cluster0");
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();


const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
