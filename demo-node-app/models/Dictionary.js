const mongoose = require('mongoose');

const dictionarySchema = new mongoose.Schema({
    language: {
        type: String,
        trim: true,
    },
    words: {
        type: String,
        trim: true,
    },
});

module.exports = mongoose.model('Dictionary', dictionarySchema);