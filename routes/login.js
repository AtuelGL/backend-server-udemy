var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');


// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);



// ================================
// Google Login
// ================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                message: 'Invalid token'
            });
        });


    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }
        if (userDB) {
            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Usted ya ha creado su cuenta sin conexión con google',
                    errors: err
                });
            } else {
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // expires in 4 hours

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                });
            }
        } else {
            var user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.passwd = ':D';
            user.google = true;

            user.save((err, userDB) => {

                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // expires in 4 hours

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                });

            });
        }


    });

    // return res.status(200).json({
    //     ok: true,
    //     message: 'google sign in anda',
    //     googleUser: googleUser
    // });
});

// ================================
// Normal Login
// ================================

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