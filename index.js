const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(bodyParser.json());  //Middleware to parse JSON body

// In-memory storage for goals and user goal counts
let goals = [];
let userGoalsCount = {};
const MAX_GOALS_PER_USER = 3; // Constants

// Function to validate userId format (example: 'user1')
function isValidUserId(userId) {
    return /^user\d+$/.test(userId); // validation: userId should start with 'user' and followed by digits
}

// Endpoint to create a new goal
app.post('/goals', (req, res) => {
    const { userId, goalTitle } = req.body;

    // Validate request body
    if (!userId || !goalTitle) {
        return res.status(400).json({ error: 'User ID and goalTitle are required.' });
    }
    if (!isValidUserId(userId)) {
        return res.status(400).json({ error: 'Invalid userId format.' });
    }
    if (goalTitle.trim() === '') {
        return res.status(400).json({ error: 'Goal title cannot be empty.' });
    }

    // Initialize user's goal count if not already set
    userGoalsCount[userId] = userGoalsCount[userId] || 0;

    // Check if the user has reached the maximum limit of goals
    if (userGoalsCount[userId] >= MAX_GOALS_PER_USER) {
        return res.status(403).json({ error: `User ${userId} has reached the maximum limit of goals (${MAX_GOALS_PER_USER}).` });
    }

    // Check for duplicate goals
    const isDuplicateGoal = goals.some(goal => goal.userId === userId && goal.goalTitle === goalTitle);
    if (isDuplicateGoal) {
        return res.status(409).json({ error: 'Goal already exists for this user.' });
    }

    // Create a new goal object
    const newGoal = {
        userId,
        goalTitle,
        created_at: new Date().toISOString(),
    };

    // Add the new goal to the goals array and increment user's goal count
    goals.push(newGoal);
    userGoalsCount[userId]++;

    res.status(201).json(newGoal); // Respond with the newly created goal
});

// Endpoint to get all goals for a specific user
app.get('/goals/:userId', (req, res) => {
    const { userId } = req.params;
    const userGoals = goals.filter(goal => goal.userId === userId);
    res.json(userGoals);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});
