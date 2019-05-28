const mongoose = require('mongoose')

const citiesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    } 
})

//name if module is the singular of how the database is called
module.exports = mongoose.model('city', citiesSchema)