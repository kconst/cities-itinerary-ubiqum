const express = require('express');
const router = express.Router();

const cityModel = require('../../models/city')


/*get all cities*/
router.get('/',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        cityModel.find({})
            .then(files => {
                res.send(files)
            })
            .catch(err => console.log(err));
    });

/* add city*/
router.post('/',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log(req.body)
        let addCity = new cityModel({
            name: req.body.name,
            country: req.body.country,
            img: req.body.img
        })
        console.log(addCity)
        addCity.save((err, files) => {
            if (err) { console.log(err) }
            res.status(201).json(files)
        })

    });

module.exports = router;