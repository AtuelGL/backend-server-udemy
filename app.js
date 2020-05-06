// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Init variables
var app = express();


// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});




// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));;
app.use(bodyParser.json());


// import routes
var appRoutes = require('./routes/app');
var imagesRoutes = require('./routes/images');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var userRoutes = require('./routes/user');
var medicRoutes = require('./routes/medic');
var hospitalRoutes = require('./routes/hospital');
var loginRoutes = require('./routes/login');

// Connection to DB
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Database: \x1b[32m%s\x1b[0m', 'online');
});


// Routes
app.use('/login', loginRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/images', imagesRoutes);
app.use('/user', userRoutes);
app.use('/medic', medicRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/', appRoutes);


// Listen requires
app.listen(3000, () => {
    console.log('express server port 3000: \x1b[32m%s\x1b[0m', 'online');
});