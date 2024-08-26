const express = require('express');
const router = express.Router();
const SentimentQuestion = require('../models/SentimentQuestion');
const NegativeSentiment = require('../models/NegativeSentiment');
const User = require('../models/User');
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");

router.post('/negative/questions', auth, async (req, res) => {
    const {label1, label2, label3} = req.body;
    const userId = req.user.userId;



    try {
        // Save the new question
        const newQuestion = new SentimentQuestion({
            userId,
            labels: {label1, label2, label3}
        });
        await newQuestion.save();

        // Fetch the last three sentiments
        const sentiments = await NegativeSentiment.find({ userId })
            .sort({ date: -1 })
            .limit(3);

        console.log("Last three sentiments:", sentiments);

        // Check if the last three sentiments are all 'Bad'
        const condition = sentiments.length === 1 && sentiments.every(s => s.responses?.toLowerCase() === "bad");

        if (condition) {
            // Fetch user details
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Set up email transporter
            let transporter = nodemailer.createTransport({
                service: "gmail",
                port: 465,
                auth: {
                    user: "mentalmilestone24@gmail.com",
                    pass: "yfje xcgv tmsd vuiu",
                }
            });
            const q1 = '1.How often do you experience the problem';
            const q2 = '2. How have you been coping with the problems that brought you into thearpy';
            const q3 = '3. what do you think caused the situation to worsen';
            // Prepare email
            let mailOptions = {
                from: "mentalmilestone24@gmail.com",
                to: user.guideEmail,
                subject: "Alert: Negative Sentiment Detected",
                text: `${user.email} has reported negative sentiments consistently. \n ${q1} \n ${label1} \n ${q2} \n ${label2} \n ${q3} \n ${label3}`,
            };

            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Error sending email:", error);
                } else {
                    console.log("Email sent:", info.response);
                }
            });
        }

        res.status(201).json({label1, label2, label3});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;