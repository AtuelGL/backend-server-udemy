var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');


app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales no validas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.passwd, userDB.passwd)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales no validas - passwd',
                errors: err
            });
        }


        // Crear Token
        userDB.passwd = ':D';
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // expires in 4 hours


        res.status(200).json({
            ok: true,
            user: userDB,
            token: token,
            id: userDB._id
        });
    });
});



module.exports = app;