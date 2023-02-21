const express = require('express'),
  morgan = require('morgan'),

  // import built in node modules fs and path
  fs = require('fs');   
  path = require('path');
  const app = express();

let topMovies = [
{
    title: 'The Godfather',
    ayear: '1972'
},
{
    title: 'The Shawshank Redemption',
    year: '1994'
},
{
    title: 'Schindler\'s List',
    year: '1993'
},
{
    title: ' Raging Bull',
    year: '1980'
},
{
    title: 'Casablanca ',
    year: '1940'
},
{
    title: 'Citizen Kane',
    year: '1941'
},
{
    title: 'Vertigo',
    year: '1958'
},
{
    title: 'Forrest Gump',
    year: '1994'
},
{
    title: 'The Sound of Music',
    year: '1965'
},
{
    title: 'The Silence of the Lambs ',
    year: '1991'
},
{
    title: 'Gladiator',
    year: '2000'
},
{
    title: 'Titanic',
    year: '1997'
},
{
    title: 'Saving Private Ryan',
    year: '1998'
}

];

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