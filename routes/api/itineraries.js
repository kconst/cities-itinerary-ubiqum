const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

//importing the itinerary model
const itineraryModel = require('../../models/itinerary')

router.get('/', (req, res) => {
    itineraryModel.find()
        //telling mongoose to populate the field city in the itineraries model with the value of id and name of the model city
        // .populate('comments', ['username', 'date', 'avatarPicture', 'message'])
        .then(files => {
            res.send(files)
        })
        .catch(err => console.log(err))
})

router.get('/:id', (req, res) => {
    let cityRequested = req.params.id
    // console.log(cityRequested)
    itineraryModel.find({ 'city': cityRequested }, (err, itineraryList) => {
        if (err) throw err;
        // console.log(itineraryList)
        res.send(itineraryList)
    })
});

router.post('/', (req, res, next) => {
    console.log(req.body)
    const { city, title, img, summary, duration,
        price, rating } = req.body
    let addItinerary = new itineraryModel({
        city: city,
        title: title,
        img: img,
        summary: summary,
        duration: duration,
        price: price,
        rating: rating
    })
    addItinerary.save((err, files) => {
        if (err) { console.log(err) }
        res.status(201).json(files)
    })

});

module.exports = router