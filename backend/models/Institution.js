const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    region: { type: String, default: 'Northern' },
    address: String,
    role: { type: String, default: 'INSTITUTION' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institution', InstitutionSchema);

