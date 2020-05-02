// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Init variables
var app = express();


// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));;
app.use(bodyParser.json());


// import routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');

// Connection to DB
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Database: \x1b[32m%s\x1b[0m', 'online');
});


// Routes
app.use('/login', loginRoutes);
app.use('/user', userRoutes);
app.use('/', appRoutes);


// Listen requires
app.listen(3000, () => {
    console.log('express server port 3000: \x1b[32m%s\x1b[0m', 'online');
});