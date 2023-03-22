"use strict";

const express = require('express'),
  morgan = require('morgan'),
  app = express(),  
  bodyParser = require('body-parser'),
  uuid = require ('uuid'),
  fs = require('fs'),   
  path = require('path');  

const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const cors = require('cors');
app.use(cors());
const passport = require('passport');
require('./passport');

/*/Integrating local MongoDB with REST_API 
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });*/

//Integrating online Mongo DB with REST_API 
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
/* allows the return of multiple static files in response to a request */
app.use(express.static('public'));
// setup the logger
app.use(morgan('combined', {stream: accessLogStream})); 


//  ! ENDPOINT MIDDLEWARE !

//default text response when at/
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

// return JSON object with all movies  (Return a list of ALL movies to the user)
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res)=> {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err)=> {
      console.error(err);      
      res.status(500).send("Error: "+ err);
    });
});

//get data about single movie name  (Return data about a single movie by title to the user)
app.get("/movies/:Title", passport.authenticate('jwt', { session: false }), (req, res)=> {
  Movies.findOne({Title: req.params.Title})
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err)=> {
      console.error(err);
      res.status(500).send("Error: "+ err);
    });
});

// get data about movie genre (Return data about a genre)
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

 // get data about movie directior (Return data about a director.exit)
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
}); 

//Add a new user (Allow new users to register)
app.post('/users', [  
  check('UserName', 'Username is required').isLength({min: 5}),
  check('UserName', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
 ], (req, res) => {
// check the validation object for errors
  let errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ UserName: req.body.UserName })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.UserName + 'already exists');
        } else {
          Users
            .create({
              UserName: req.body.UserName,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Get all users
app.get('/users',  passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:UserName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ UserName: req.params.UserName })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update a user's info, by username (Allow users to update their user info )
app.put('/users/:UserName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ UserName: req.params.UserName }, { $set:
    {
      UserName: req.body.UserName,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true } // This line makes sure that the updated document is returned
  /*(err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  }*/).then((updatedUser) => {res.json(updatedUser)})
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Add a movie to a user's list of favorites (Allow users to add a movie to their list of favorites)
app.post('/users/:UserName/movies/:_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ UserName: req.params.UserName }, {
     $push: { FavoriteMovies: req.params._id }
   },
   { new: true } // This line makes sure that the updated document is returned
  /*(err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  }*/).then((updatedUser) => {res.json(updatedUser)})
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE a movie to a user's list of favorites (Allow users to remove a movie from their list of favorites)
app.delete('/users/:UserName/movies/:_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ UserName: req.params.UserName }, {
     $pull: { FavoriteMovies: req.params._id }
   },
   { new: true }, // This line makes sure that the updated document is returned
  /*(err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  }*/).then((updatedUser) => {res.json(updatedUser)})
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Delete a user by username (Allow existing users to deregister)
app.delete('/users/:UserName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ UserName: req.params.UserName })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.UserName + ' was not found');
      } else {
        res.status(200).send(req.params.UserName + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
  });

/* error handler
comes after all route calls and app.use but before app.listen */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('It is not working');
  });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});