// server.js - Node.js backend to handle form submissions
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// Path to feedback.json file
const FEEDBACK_FILE = path.join(__dirname, 'data', 'feedback.json');

// Ensure data directory and feedback.json file exist
async function initializeDataFile() {
    try {
        const dataDir = path.join(__dirname, 'data');
        
        // Create data directory if it doesn't exist
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
            console.log('Created data directory');
        }
        
        // Create feedback.json if it doesn't exist
        try {
            await fs.access(FEEDBACK_FILE);
        } catch {
            await fs.writeFile(FEEDBACK_FILE, JSON.stringify([], null, 2));
            console.log('Created feedback.json file');
        }
    } catch (error) {
        console.error('Error initializing data file:', error);
    }
}

// Read existing feedback data
async function readFeedbackData() {
    try {
        const data = await fs.readFile(FEEDBACK_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading feedback data:', error);
        return [];
    }
}

// Write feedback data
async function writeFeedbackData(data) {
    try {
        await fs.writeFile(FEEDBACK_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing feedback data:', error);
        return false;
    }
}

// API endpoint to submit feedback
app.post('/api/submit-feedback', async (req, res) => {
    try {
        const {
            role,
            name,
            email,
            instagram,
            last_campaign,
            worst_part,
            one_thing
        } = req.body;

        // Validate required fields
        if (!role || !name || !email || !instagram || !last_campaign || !worst_part || !one_thing) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create feedback object
        const feedbackEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            role,
            name,
            email,
            instagram,
            last_campaign,
            worst_part,
            one_thing,
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress
        };

        // Read existing data
        const existingData = await readFeedbackData();
        
        // Add new entry
        existingData.push(feedbackEntry);
        
        // Write back to file
        const writeSuccess = await writeFeedbackData(existingData);
        
        if (writeSuccess) {
            console.log('New feedback submitted:', feedbackEntry.id);
            res.json({
                success: true,
                message: 'Feedback submitted successfully',
                id: feedbackEntry.id
            });
        } else {
            throw new Error('Failed to save feedback');
        }

    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// API endpoint to get all feedback (for admin purposes)
app.get('/api/feedback', async (req, res) => {
    try {
        const feedbackData = await readFeedbackData();
        res.json({
            success: true,
            data: feedbackData,
            count: feedbackData.length
        });
    } catch (error) {
        console.error('Error getting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving feedback'
        });
    }
});

// API endpoint to get feedback stats
app.get('/api/feedback/stats', async (req, res) => {
    try {
        const feedbackData = await readFeedbackData();
        
        const stats = {
            total: feedbackData.length,
            byRole: {
                creator: feedbackData.filter(f => f.role === 'creator').length,
                promoter: feedbackData.filter(f => f.role === 'promoter').length,
                other: feedbackData.filter(f => f.role === 'other').length
            },
            recent24h: feedbackData.filter(f => {
                const entryDate = new Date(f.timestamp);
                const now = new Date();
                return (now - entryDate) < (24 * 60 * 60 * 1000);
            }).length,
            recent7days: feedbackData.filter(f => {
                const entryDate = new Date(f.timestamp);
                const now = new Date();
                return (now - entryDate) < (7 * 24 * 60 * 60 * 1000);
            }).length
        };
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error getting feedback stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving feedback stats'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        server: 'Togetai Feedback API'
    });
});

// Initialize and start server
async function startServer() {
    await initializeDataFile();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 Feedback data saved to: ${FEEDBACK_FILE}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        console.log(`📊 View feedback: http://localhost:${PORT}/api/feedback`);
    });
}

startServer().catch(console.error);