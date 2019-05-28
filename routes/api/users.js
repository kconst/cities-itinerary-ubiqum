const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const userModel = require('../../models/user');
const itineraryModel = require('../../models/itinerary');
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require('passport');


router.post('/register', (req, res) => {

    //check if email already exists in database
    userModel.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                return res
                    .status(400)
                    .json({ error: 'This email has been already used!' });
            }
            if (req.body.password !== req.body.passwordConfirmation) {
                return res
                    .status(400)
                    .json({ error: 'The passwords do not match' })
            }

            //create new user
            const newUser = new userModel({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                avatarPicture: req.body.avatarPicture
            });

            //hash password before saving it
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        });
});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //find user by email

    userModel.findOne({ email })
        .then(user => {
            //check if user exists
            if (!user) {
                return res.status(400).json({ emailnotfound: 'Email not found' });
            }

            //check password
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                    //create JWT payload
                    const payload = {
                        id: user.id,
                        username: user.username,
                        avatarPicture: user.avatarPicture
                    };

                    //sign token
                    jwt.sign(
                        payload,
                        keys.secretOrKey,
                        {
                            expiresIn: 2592000
                        },
                        (err, token) => {
                            res.json({
                                success: true,
                                token: 'bearer ' + token,
                            });
                        }
                    );
                } else {
                    return res
                        .status(400)
                        .json({ passwordincorrect: 'Password incorrect' })
                }
            })
                .catch(err => console.log(err));
        });
});


router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userModel.findOne({ _id: req.user.id })
            .then(response => {
                // remove password before sending back
                const userDetails = Object.assign({}, response._doc);
                delete userDetails.password;

                res.json(userDetails);
            })
            .catch(err => res.status(404).json({ error: "User does not exist!" }));
    }
);

router.post('/addToFavorite',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        userModel.findOne({ _id: req.user.id })
            .then(user => {

                let currentFavItineraries = user.favoriteItineraries.filter(oneFavItin => oneFavItin.itineraryId === req.body.itineraryId)

                if (currentFavItineraries.length !== 0) {
                    res
                        .status(400)
                        .json({ error: "User already liked this itinerary!" });
                } else {
                    itineraryModel.findOne({ _id: req.body.itineraryId })
                        .then(itinerary => {
                            // console.log(itinerary)
                            user.favoriteItineraries.push({
                                itineraryId: req.body.itineraryId,
                                name: itinerary.title,
                                cityId: itinerary.city
                            });

                            user
                                .save()
                                .then(userFavItin => res.json(user.favoriteItineraries))
                                .catch(err => {
                                    res
                                        .status(500)
                                        .json({ error: 'The itinerary could not be saved' })
                                })
                        })
                        .catch(err => {
                            res
                                .status(404)
                                .json({ error: 'Cannot find the itinerary with this id!' })
                        })
                }
            })
            .catch(err => {
                res
                    .status(404)
                    .json({ error: 'User not found' })
            })
    }
);

router.post('/removeFromFavorite',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        userModel.findOne({ _id: req.user.id })
            .then(user => {

                let currentFavItineraries = user.favoriteItineraries.filter(oneFavItin => oneFavItin.itineraryId === req.body.itineraryId)

                if (currentFavItineraries.length === 0) {
                    res
                        .status(400)
                        .json({ error: "User did not like this itinerary!" });
                }

                itineraryModel.findOne({ _id: req.body.itineraryId })
                    .then(itinerary => {
                        const indexItinToRemove = user.favoriteItineraries.map(oneFavItin => oneFavItin.itineraryId).indexOf(req.body.itineraryId);
                        console.log(indexItinToRemove)
                        user.favoriteItineraries.splice(indexItinToRemove, 1);

                        user
                            .save()
                            .then(userFavItin => res.json(user.favoriteItineraries))
                            .catch(err => {
                                res
                                    .status(500)
                                    .json({ error: 'There was a saving error' })
                            })
                    })
                    .catch(err => {
                        res
                            .status(404)
                            .json({ error: 'Cannot find the itinerary with this id!' })
                    })
            })
            .catch(err => {
                res
                    .status(404)
                    .json({ error: 'User not found' })
            })
    }
);


module.exports = router