var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medic = require('../models/medic');


app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    var regEx = new RegExp(search, 'i');

    searchHospitals(search, regEx)
        .then(hospitals => {
            res.status(200).json({
                ok: true,
                hospitals: hospitals
            });
        });

});

function searchHospitals(search, regEx) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regEx }, (err, hospitals) => {
            if (err) {
                reject('Error al cargar hospitales', err);
            } else {
                resolve(hospitals)
            }
        });
    });
}

module.exports = app;