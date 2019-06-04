const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var User = require('../../models/user');
const itineraryModel = require('../../models/itinerary');
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require('passport');

router.post('/register', async (req, res) => {

    const { name, email, password, img } = req.body
    try {
        let user = await User.findOne({ email })
        if (user) {
            res.status(400).json({ errors: [{ msg: 'Email taken.' }] })
        }
        user = new User({
            name,
            email,
            img,
            password
        })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        await user.save()

        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload,
            keys.secret,
            {
                expiresIn: 2592000
            },
            (err, token) => {
                res.json({
                    user,
                    success: true,
                    token: 'bearer ' + token,
                });
            }
        );

    } catch (err) {
        console.error(err)
        res.status(500).send('Server error')
    }
})

module.exports = router


router.post('/login', (req, res) => {
    const { email, password } = req.body;
    //find user by email

    User.findOne({ email })
        .then(user => {
            //check if user exists
            if (!user) {
                return res.status(400).json({ error: 'Email not found' });
            }
            if (!password) {
                return res.status(400).json({ error: 'Enter password' });
            }

            //check password
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {

                    const payload = {
                        user: {
                            id: user.id
                        }
                    }
                    jwt.sign(
                        payload,
                        keys.secret,
                        {
                            expiresIn: 2592000
                        },
                        (err, token) => {
                            res.json({
                                user,
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
    user = req.user
    const payload = {
        user: {
            id: user.id
        }
    }
    jwt.sign(
        payload,
        keys.secret,
        {
            expiresIn: 2592000
        },
        (err, token) => {
            res.json({
                user,
                success: true,
                token: 'bearer ' + token,
            });
        }
    );
    //res.redirect('/profile');
});

router.get("/all",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        User.find({})
            .then(users => {
                res.json(
                    users.map(e => {
                        return {
                            id: e.id,
                            name: e.name,
                            email: e.email
                        }
                    }
                    ))
            })
            .catch(err => res.status(404).json({ error: "No users" }));
    }
);

router.get("/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { id } = req.query
        // User.findOne({ _id: req.user.id })
        User.findOne({ _id: id })
            .then(response => {
                // remove password before sending back
                const userDetails = Object.assign({}, response._doc);
                delete userDetails.password;

                res.json(userDetails);
            })
            .catch(err => res.status(404).json({ error: "User does not exist!" }));
    }
);
// router.get('/', (req, res) => {
//     User.find({})
//         .then(files => {
//             res.send(files)
//         })
//         .catch(err => console.log(err));
// });

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