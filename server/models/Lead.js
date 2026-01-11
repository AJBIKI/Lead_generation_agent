const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    company_name: { type: String, required: true },
    website: { type: String },
    context: { type: String }, // Why it matches ICP

    // Research Data (Deep Dive)
    summary: { type: String },
    technologies: [String],
    key_personnel: [String],

    // Metadata
    status: { type: String, enum: ['new', 'researching', 'contacted', 'qualified', 'disqualified'], default: 'new' },
    source: { type: String, default: 'ai_prospector' },
    confidence_score: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);
