require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection, syncDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Smart Food Dynamic Pricing API',
        status: 'running',
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Initialize database and start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();
        
        // Sync database (create tables if not exist)
        await syncDatabase();
        
        // Start server
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: ${process.env.DB_DATABASE}`);
            console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
            console.log('='.repeat(60) + '\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();