const express = require('express'),
  morgan = require('morgan'),
  app = express(),  
  bodyParser = require('body-parser'),
  uuid = require ('uuid');

  app.use(bodyParser.json());

  // import built in node modules fs and path
  fs = require('fs');   
  path = require('path');  

let movies = [
{
    "title": "The Flash",
    "director": "Andy Muschietti",
    "genre": "Action",
    "year": "2023"
},
{
    "title": "Babylon",
    "director": "Damien Chazelle",
    "genre": "Drama",
    "year": "2022"
},
{
    "title": "The Menu",
    "director":{
        "name":"Mark Mylod",
    },
    "genre": "Horror",
    "year": "2022"
},
{
    "title": "Plane",
    "director": "Jean-François Richet",
    "genre": "Adventure",
    "year": "2023"
},
{
    "title": "Sharper",
    "director": "Benjamin Caron",
    "genre": "Crime",
    "year": "2023"
}
];

let users = [
    {
        "id": "1",
        "name": "Alan",
        "favoriteMovie": []
      },
      {
        "id": "2",
        "name": "Alicia",
        "favoriteMovie": ["True"],
      }
    ]
//CREATE
// create a new user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id= uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need name')
    }
})

//UPDATE
// update name of a user
app.put('/users/:id', (req, res) => {
    const { id } =req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }
})

//CREATE
// create favoriteMovie title for user
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } =req.params;


    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovie.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE
//delete movie titel of user
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } =req.params;


    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovie = user.favoriteMovie.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE
// delete user
app.delete('/users/:id', (req, res) => {
    const { id } =req.params;


    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        //res.json(users)
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user')
    }
})

//READ (GET requests)
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

//get data about single movie name
app.get('/movies/:title', (req, res) => {
   const { title } =req.params;
   const movie = movies.find( movie => movie.title === title);

   if (movie) {
    res.status(200).json(movie);
   } else {
    res.status(400).send('no such movie')
   }
})

// get data about movie genre
app.get('/movies/:genre', (req, res) => {
    const { genre } =req.params;
    const genreName = movies.find( movie => movie.genre === genre);

    if (genreName) {
     res.status(200).json(genre);
    } else {
     res.status(400).send('no such genre')
    }
 })

 // get data about movie directior 
 app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } =req.params;
    const director = movies.find( movie => movie.director.name === directorName).director;

    if (director) {
     res.status(200).json(director);
    } else {
     res.status(400).send('no such director')
    }
 })

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

/* allows the return of multiple static files in response to a request */
app.use(express.static('public'));

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// GET requests

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
  });

app.get('/movies', (req, res) => {
    res.json(topMovies);
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

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});