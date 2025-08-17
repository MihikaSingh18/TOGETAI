const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public')); // Serve static files from public directory

// Path to feedback.json
const feedbackPath = path.join(__dirname, 'data', 'feedback.json');

// Ensure data directory and feedback.json exist
async function initializeFeedbackFile() {
    try {
        const dataDir = path.dirname(feedbackPath);
        await fs.mkdir(dataDir, { recursive: true });
        
        // Check if feedback.json exists, if not create it
        try {
            await fs.access(feedbackPath);
        } catch (error) {
            // File doesn't exist, create it with empty array
            await fs.writeFile(feedbackPath, JSON.stringify([], null, 2));
            console.log('Created feedback.json file');
        }
    } catch (error) {
        console.error('Error initializing feedback file:', error);
    }
}

// Read feedback data
async function readFeedback() {
    try {
        const data = await fs.readFile(feedbackPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading feedback:', error);
        return [];
    }
}

// Write feedback data
async function writeFeedback(data) {
    try {
        await fs.writeFile(feedbackPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing feedback:', error);
        return false;
    }
}

// API Routes

// GET - Retrieve all feedback (for admin purposes)
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await readFeedback();
        res.json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving feedback'
        });
    }
});

// POST - Submit new feedback
app.post('/api/early-access', async (req, res) => {
    try {
        const { name, email, instagram, prompt } = req.body;

        // Validate required fields
        if (!name || !email || !instagram || !prompt) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Read existing feedback
        const existingFeedback = await readFeedback();

        // Check for duplicate email
        const duplicateEmail = existingFeedback.find(entry => entry.email.toLowerCase() === email.toLowerCase());
        if (duplicateEmail) {
            return res.status(409).json({
                success: false,
                message: 'This email has already been registered for early access'
            });
        }

        // Create new feedback entry
        const newEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            instagram: instagram.trim().replace('@', ''), // Remove @ if user added it
            prompt: prompt.trim(),
            status: 'pending', // For tracking invitation status
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Add to feedback array
        existingFeedback.push(newEntry);

        // Write to file
        const writeSuccess = await writeFeedback(existingFeedback);

        if (writeSuccess) {
            console.log(`New early access request: ${email}`);
            res.json({
                success: true,
                message: 'Thank you! Your request has been submitted successfully.',
                id: newEntry.id
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error saving your request. Please try again.'
            });
        }

    } catch (error) {
        console.error('Error processing early access request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// DELETE - Remove feedback entry (for admin purposes)
app.delete('/api/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existingFeedback = await readFeedback();
        
        const filteredFeedback = existingFeedback.filter(entry => entry.id !== id);
        
        if (filteredFeedback.length === existingFeedback.length) {
            return res.status(404).json({
                success: false,
                message: 'Feedback entry not found'
            });
        }

        const writeSuccess = await writeFeedback(filteredFeedback);
        
        if (writeSuccess) {
            res.json({
                success: true,
                message: 'Feedback entry deleted successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error deleting feedback entry'
            });
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Togetai API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start server
async function startServer() {
    await initializeFeedbackFile();
    
    app.listen(PORT, () => {
        console.log(`🚀 Togetai server running on http://localhost:${PORT}`);
        console.log(`📝 Feedback data will be saved to: ${feedbackPath}`);
        console.log(`🌐 API endpoints:`);
        console.log(`   GET  /api/health - Health check`);
        console.log(`   POST /api/early-access - Submit early access request`);
        console.log(`   GET  /api/feedback - View all feedback (admin)`);
    });
}

startServer().catch(console.error);