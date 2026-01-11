const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const logger = require('./logger');
const agentRoutes = require('./routes/agents');
const leadRoutes = require('./routes/leads');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.http(message.trim()) } }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lead_generator')
    .then(() => logger.info('Connected to MongoDB'))
    .catch((err) => logger.error(`MongoDB Connection Error: ${err.message}`));

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/leads', leadRoutes);

app.get('/', (req, res) => {
    res.send('Lead Generation Agency API is running');
});

// Start Server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
