const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    username: {
        type: String,
        required: true
    },
    avatarPicture: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    },
    itineraryId: mongoose.Schema.Types.ObjectId    
})

module.exports = mongoose.model('comment', commentsSchema);