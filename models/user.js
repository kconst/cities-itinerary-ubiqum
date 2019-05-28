const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    avatarPicture: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    passwordConfirmation: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    favoriteItineraries: {
        type: Array
    }
})

module.exports = mongoose.model('user', usersSchema)