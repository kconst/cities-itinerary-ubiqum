const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const isEmpty = require('is-empty');

const commentsModel = require('../../models/comment');
const userModel = require('../../models/user');

router.get('/', (req, res) => {
    commentsModel.find({})
        .sort({date: -1})
        .then(files => {
            res.json(files)
        })
        .catch(err => console.log(err));
});

router.get('/itineraries/:id', (req, res) => {
    let currentItineary = req.params.id;
    commentsModel.find({'itineraryId': currentItineary})
        .sort({date: -1})
        .then(itineraryComments => res.json(itineraryComments))
        .catch(err => console.log(err))
});

router.post('/', passport.authenticate("jwt", { session: false }), (req, res) => {
    userModel.findById(req.user.id, (err, user) => {
        if(err) throw new Error(err);
    })

    const newComment = new commentsModel({
        user: req.user.id,
        username: req.body.username,
        avatarPicture: req.body.avatarPicture,
        message: req.body.message,
        itineraryId: req.body.itineraryId
    })

    newComment
        .save()
        .then(comment => res.json(comment))
        .catch(err => console.log(err));
})

module.exports = router

