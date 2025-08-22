const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submissions
app.post('/submit-signup', async (req, res) => {
    try {
        console.log('Received signup data:', req.body);
        
        // Create feedback entry
        const feedbackEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            role: req.body.role,
            name: req.body.name,
            email: req.body.email,
            instagram: req.body.instagram,
            lastCampaign: req.body.last_campaign,
            worstPart: req.body.worst_part,
            platformHelp: req.body.platform_help,
            oneThing: req.body.one_thing
        };
        
        // Ensure data directory exists
        const dataDir = path.join(__dirname, 'data');
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
        
        // Read existing feedback or create new array
        const feedbackFile = path.join(dataDir, 'feedback.json');
        let existingFeedback = [];
        
        try {
            const data = await fs.readFile(feedbackFile, 'utf8');
            existingFeedback = JSON.parse(data);
        } catch (error) {
            // File doesn't exist or is invalid, start with empty array
            console.log('Creating new feedback file');
        }
        
        // Add new entry
        existingFeedback.push(feedbackEntry);
        
        // Write back to file
        await fs.writeFile(feedbackFile, JSON.stringify(existingFeedback, null, 2));
        
        console.log(`Feedback saved successfully. Total entries: ${existingFeedback.length}`);
        
        // Send success response
        res.json({ 
            success: true, 
            message: 'Thank you for your interest! We\'ll be in touch soon.',
            id: feedbackEntry.id 
        });
        
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sorry, there was an error processing your request. Please try again.' 
        });
    }
});

// API endpoint to view feedback (for development)
app.get('/api/feedback', async (req, res) => {
    try {
        const feedbackFile = path.join(__dirname, 'data', 'feedback.json');
        const data = await fs.readFile(feedbackFile, 'utf8');
        const feedback = JSON.parse(data);
        res.json(feedback);
    } catch (error) {
        res.json([]);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Togetai server running on http://localhost:${PORT}`);
    console.log(`📊 View feedback at http://localhost:${PORT}/api/feedback`);
    console.log(`💡 Make sure your HTML file is in the 'public' folder`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 Server shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 Server shutting down gracefully');
    process.exit(0);
});