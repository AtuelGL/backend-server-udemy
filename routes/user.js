var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutentication = require('../middlewares/autentication');
var app = express();


var User = require('../models/user');

// ================================
// Get Users
// ================================

app.get('/', (req, res, next) => {

    var from = req.query.from || 0;
    from = Number(from);

    User.find({}, 'name email img role google')
        .skip(from)
        .limit(5)
        .exec(
            (err, users) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al obtener users',
                        errors: err
                    });
                }

                User.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        users: users,
                        total: count
                    });
                });


            });
});


// ================================
// Update Users
// ================================
app.put('/:id', mdAutentication.verifyToken, (req, res) => {

    var body = req.body;
    var id = req.params.id;

    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario de id' + id + 'no existe',
                errors: { message: 'no existe usuario con ese id' }
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: err
                });
            }

            userSaved.passwd = ':D';

            res.status(200).json({
                ok: true,
                user: userSaved
            });
        });
    });
});


// ================================
// Post User
// ================================
app.post('/', (req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        passwd: bcrypt.hashSync(body.passwd, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, userSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error creating user',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            user: userSaved,
            userToken: req.user
        });
    });
});


// ================================
// Delete Users 
// ================================
app.delete('/:id', mdAutentication.verifyToken, (req, res) => {
    var id = req.params.id;
    User.findByIdAndRemove(id, (err, userDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting user',
                errors: err
            });
        }
        if (!userDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'There aren\'t user with id ' + id,
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            user: userDeleted
        });
    });
});




module.exports = app;