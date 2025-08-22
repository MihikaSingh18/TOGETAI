const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced logging
const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
};

log('🚀 Starting Togetai server with debug logging...');

// Middleware with logging
app.use(cors());
log('✅ CORS middleware enabled');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
log('✅ Body parser middleware enabled');

// Request logging middleware
app.use((req, res, next) => {
    log(`${req.method} ${req.url}`, {
        headers: req.headers,
        body: req.body,
        query: req.query
    });
    next();
});

// Serve static files from public directory
app.use(express.static('public'));
log('✅ Static file serving from public directory enabled');

// Serve the main HTML file
app.get('/', (req, res) => {
    log('📄 Serving main page');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submissions with detailed logging
app.post('/submit-signup', async (req, res) => {
    log('📝 Form submission received');
    
    try {
        log('📊 Request body received:', req.body);
        
        // Validate required fields
        const requiredFields = ['role', 'name', 'email', 'instagram', 'last_campaign', 'worst_part', 'platform_help', 'one_thing'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            log('❌ Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        
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
            oneThing: req.body.one_thing,
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
        };
        
        log('✅ Feedback entry created:', feedbackEntry);
        
        // Ensure data directory exists
        const dataDir = path.join(__dirname, 'data');
        log(`📁 Checking data directory: ${dataDir}`);
        
        try {
            await fs.access(dataDir);
            log('✅ Data directory exists');
        } catch {
            log('📁 Creating data directory...');
            await fs.mkdir(dataDir, { recursive: true });
            log('✅ Data directory created');
        }
        
        // Read existing feedback or create new array
        const feedbackFile = path.join(dataDir, 'feedback.json');
        log(`📄 Feedback file path: ${feedbackFile}`);
        
        let existingFeedback = [];
        
        try {
            log('📖 Reading existing feedback file...');
            const data = await fs.readFile(feedbackFile, 'utf8');
            existingFeedback = JSON.parse(data);
            log(`✅ Existing feedback loaded: ${existingFeedback.length} entries`);
        } catch (error) {
            log('📄 No existing feedback file or invalid JSON, starting fresh');
            log('Error details:', error.message);
        }
        
        // Add new entry
        existingFeedback.push(feedbackEntry);
        log(`📝 Added new entry. Total entries: ${existingFeedback.length}`);
        
        // Write back to file with detailed logging
        try {
            log('💾 Writing feedback to file...');
            const jsonData = JSON.stringify(existingFeedback, null, 2);
            await fs.writeFile(feedbackFile, jsonData, 'utf8');
            log('✅ Feedback file written successfully');
            
            // Verify the write
            const verification = await fs.readFile(feedbackFile, 'utf8');
            const verifyData = JSON.parse(verification);
            log(`✅ Verification: File contains ${verifyData.length} entries`);
            
        } catch (writeError) {
            log('❌ Error writing to feedback file:', writeError);
            throw writeError;
        }
        
        log(`✅ Feedback saved successfully. Total entries: ${existingFeedback.length}`);
        
        // Send success response
        const response = { 
            success: true, 
            message: 'Thank you for your interest! We\'ll be in touch soon.',
            id: feedbackEntry.id,
            totalEntries: existingFeedback.length
        };
        
        log('📤 Sending success response:', response);
        res.json(response);
        
    } catch (error) {
        log('❌ Error processing form submission:', error);
        log('Error stack:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Sorry, there was an error processing your request. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// API endpoint to view feedback (with logging)
app.get('/api/feedback', async (req, res) => {
    log('📊 Feedback API endpoint requested');
    
    try {
        const feedbackFile = path.join(__dirname, 'data', 'feedback.json');
        const data = await fs.readFile(feedbackFile, 'utf8');
        const feedback = JSON.parse(data);
        log(`📊 Returning ${feedback.length} feedback entries`);
        res.json(feedback);
    } catch (error) {
        log('❌ Error reading feedback:', error.message);
        res.json([]);
    }
});

// Health check endpoint with detailed info
app.get('/health', (req, res) => {
    log('❤️  Health check requested');
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    });
});

// 404 handler
app.use('*', (req, res) => {
    log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    log('❌ Global error handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Start server with enhanced logging
app.listen(PORT, () => {
    log(`🚀 Togetai server running on port ${PORT}`);
    log(`🌐 Access your site at: http://localhost:${PORT}`);
    log(`📊 View feedback at: http://localhost:${PORT}/api/feedback`);
    log(`❤️  Health check at: http://localhost:${PORT}/health`);
    log(`📁 Working directory: ${__dirname}`);
    log(`📁 Data directory: ${path.join(__dirname, 'data')}`);
    log(`📄 Serving static files from: ${path.join(__dirname, 'public')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    log('👋 Server shutting down gracefully (SIGTERM)');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('👋 Server shutting down gracefully (SIGINT)');
    process.exit(0);
});

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    log('❌ Unhandled Rejection at:', promise);
    log('❌ Reason:', reason);
});

process.on('uncaughtException', (error) => {
    log('❌ Uncaught Exception:', error);
    process.exit(1);
});