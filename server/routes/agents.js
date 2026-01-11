const express = require('express');
const axios = require('axios');
const logger = require('../logger');
const Lead = require('../models/Lead');
const router = express.Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

router.post('/start-campaign', async (req, res) => {
    const { icp } = req.body;

    if (!icp) {
        return res.status(400).json({ error: 'ICP description is required' });
    }

    try {
        logger.info(`Starting campaign for ICP: ${icp}`);
        // Call the Python AI Engine
        const response = await axios.post(`${AI_ENGINE_URL}/prospect`, { icp });

        // Save generated leads to MongoDB
        if (response.data && response.data.data && response.data.data.reports) {
            const reports = response.data.data.reports;
            const savePromises = reports.map(report => {
                return Lead.findOneAndUpdate(
                    { website: report.website }, // Upsert based on website
                    {
                        company_name: report.company_name,
                        website: report.website,
                        context: report.context,
                        summary: report.deep_dive?.raw_content_preview || '',
                        status: 'researching',
                        source: 'ai_agent'
                    },
                    { upsert: true, new: true }
                );
            });

            await Promise.all(savePromises);
            logger.info(`Saved ${reports.length} leads to database.`);
        }

        // Return the data directly
        res.json(response.data);
    } catch (error) {
        logger.error(`AI Engine Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to start agent workflow' });
    }
});

module.exports = router;
