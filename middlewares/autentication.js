var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;




// ================================
// Verify token
// ================================
exports.verifyToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                errors: err
            });
        }

        req.user = decoded.user;
        next();
        // return res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
};


// ================================
// Verify Admin
// ================================
exports.verifyADMIN_ROLE = function(req, res, next) {

    var user = req.user;

    if (user.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Token incorrecto',
            errors: err
        });
    }
};

// ================================
// Verify Admin or Same User
// ================================
exports.verifyADMIN_ROLE_or_SameUser = function(req, res, next) {

    var user = req.user;
    var id = req.params.id;

    if (user.role === 'ADMIN_ROLE' || user._id === id) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Token incorrecto',
            errors: err
        });
    }
};