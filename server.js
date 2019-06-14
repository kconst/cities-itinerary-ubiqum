
const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const cors = require('cors')

const passport = require('passport');
const passportSetup = require('./config/passport');

const app = express();

//importing the mongoURI
const db = require('./config/keys').mongoURI;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors())
mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true })
    .then(() => console.log('Connection to Mongo DB established'))
    .catch(err => console.log(err));


//importing the routes
const cityRoutes = require('./routes/api/cities');
const itineraryRoutes = require('./routes/api/itineraries');
const userRoutes = require('./routes/api/users');
const commentRoutes = require('./routes/api/comments');


//passport configuration
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

//using the routes for a specific api
app.use('/api/cities', cityRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);

//TO REMOVE -> google domain verification
app.get('/google1132ff054dbd1d04.html', function (req, res) {
    res.send('google-site-verification: google1132ff054dbd1d04.html');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Express server running on port ${port}`)
    // console.log(process.env.MONGODB_NAME)
}

);


