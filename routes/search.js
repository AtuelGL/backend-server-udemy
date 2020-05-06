var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medic = require('../models/medic');
var User = require('../models/user');

// ================================
// Collection Search
// ================================
app.get('/collection/:table/:search', (req, res, next) => {

    var table = req.params.table;
    var search = req.params.search;
    var regEx = new RegExp(search, 'i');
    var promise;

    switch (table) {
        case 'user':
            promise = searchUser(search, regEx);
            break;
        case 'medic':
            promise = searchMedics(search, regEx);
            break;
        case 'hospital':
            promise = searchHospitals(search, regEx);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Las tablas válidas son User, Medic y Hospital',
                error: { message: 'Tabla de busqueda inválida' }
            });
    }
    promise.then(data => {
        res.status(200).json({
            ok: true,
            [table]: data
        });
    });
});

// ================================
// General Search
// ================================

app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    var regEx = new RegExp(search, 'i');

    Promise.all([
            searchHospitals(search, regEx),
            searchMedics(search, regEx),
            searchUser(search, regEx)
        ])
        .then(result => {
            res.status(200).json({
                ok: true,
                Hospitals: result[0],
                Medics: result[1],
                Users: result[2]
            });
        });
});




function searchHospitals(search, regEx) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regEx })
            .populate('user', 'name email')
            .exec((err, hospitals) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitals);
                }
            });
    });
}

function searchMedics(search, regEx) {
    return new Promise((resolve, reject) => {
        Medic.find({ name: regEx })
            .populate('user', 'name email')
            .populate('hospital')
            .exec((err, medics) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medics)
                }
            });
    });
}

function searchUser(search, regEx) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name email role google img')
            .or([{ 'name': regEx }, { 'email': regEx }])
            .exec((err, users) => {
                if (err) {
                    reject('Error al cargar users', err);
                } else {
                    resolve(users);
                }
            });
    });
}

module.exports = app;