const mongoose = require('mongoose')
//creating schema for itineraries: a schema defines document properties through an object where the key name corresponds
//to the property name in the collection.
const itinerariesSchema = new mongoose.Schema({
    city: {
        // //telling mongoose that I will be referencing other objects from other collections
        // type: mongoose.Schema.Types.ObjectId,
        // //telling mongoose which model to use
        // ref: 'city'
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    profilePic: String,
    rating: Number,
    duration: {
        type: Number,
        required: true
    },
    price: Number,
    hashtag: Array,
    activities: {
        type: Array,
        required: true
    }
})
//exporting a model and passing the collection name and the schema definition
//name of module is the singular of how the database is called
module.exports = mongoose.model('itinerary', itinerariesSchema)