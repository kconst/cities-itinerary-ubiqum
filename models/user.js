const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    img: {
        type: String,
    },
    googleId: {
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
    }
    // date: {
    //     type: Date,
    //     default: Date.now
    // },
    // favoriteItineraries: {
    //     type: Array
    // }
})
module.exports = mongoose.model('user', usersSchema)


