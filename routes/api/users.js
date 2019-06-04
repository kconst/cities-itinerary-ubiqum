const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var User = require('../../models/user');
//mongoose.model('user');
const itineraryModel = require('../../models/itinerary');
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require('passport');

router.post('/register', (req, res) => {
    const { name, email, password, img } = req.body
    console.log(req.boqy)
    user = new User({
        googleId: null,
        name,
        email,
        password
    })
    //check if email already exists in database
    User.findOne({ email })
        .then(user => {
            if (user) {
                return res
                    .status(400)
                    .json({ error: 'This email has been already used!' });
            }
            // if (req.body.password !== req.body.passwordConfirmation) {
            //   return res
            //     .status(400)
            //     .json({ error: 'The passwords do not match' })
            // }

            //create new user

            User = new User({
                name,
                email,
                password
            })
            //hash password before saving it
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(User.password, salt, (err, hash) => {
                    if (err) throw err;
                    User.password = hash;
                    User
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        });
});
// router.post('/register', (req, res) => {
//     console.log(req.body)
//     //check if email already exists in database
//     userModel.findOne({ email: req.body.email })
//         .then(user => {
//             if (user) {
//                 return res
//                     .status(400)
//                     .json({ error: 'This email has been already used!' });
//             }
//             if (req.body.password !== req.body.passwordConfirmation) {
//                 return res
//                     .status(400)
//                     .json({ error: 'The passwords do not match' })
//             }

//             //create new user
//             const newUser = new userModel({
//                 name: req.body.username,
//                 email: req.body.email,
//                 password: req.body.password,
//                 img: req.body.avatarPicture
//             });

//             console.log(newUser.password)
//             //hash password before saving it
//             bcrypt.genSalt(10, (err, salt) => {
//                 bcrypt.hash(newUser.password, salt, (err, hash) => {
//                     if (err) throw err;
//                     newUser.password = hash;
//                     newUser
//                         .save()
//                         .then(user => res.json(user))
//                         .catch(err => console.log(err));
//                 });
//             });
//         });
// });

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //find user by email

    User.findOne({ email })
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
                        keys.secret,
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
// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    console.log(req.user)
    res.send(req.user);
    //res.redirect('/profile');
});

// router.get("/",
//     passport.authenticate("jwt", { session: false }),
//     (req, res) => {
//         userModel.findOne({ _id: req.user.id })
//             .then(response => {
//                 // remove password before sending back
//                 const userDetails = Object.assign({}, response._doc);
//                 delete userDetails.password;

//                 res.json(userDetails);
//             })
//             .catch(err => res.status(404).json({ error: "User does not exist!" }));
//     }
// );
router.get('/', (req, res) => {
    user.find({})
        .then(files => {
            res.send(files)
        })
        .catch(err => console.log(err));
});
router.post('/addToFavorite',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        user.findOne({ _id: req.user.id })
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
        user.findOne({ _id: req.user.id })
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