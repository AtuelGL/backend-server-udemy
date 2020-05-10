var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutentication = require('../middlewares/autentication');
var app = express();


var Medic = require('../models/medic');

// ================================
// Get Medics
// ================================

app.get('/', (req, res, next) => {

    var from = req.query.from || 0;
    from = Number(from);

    Medic.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medics) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al obtener medics',
                        errors: err
                    });
                }
                Medic.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        medics: medics,
                        total: count
                    });
                });
            });
});

// ================================
// Get Medics by Id
// ================================
app.get('/:id', (req, res, next) => {
    var id = req.params.id;
    Medic.findById(id)
        .populate('user', 'name email img')
        .populate('hospital')
        .exec((err, medic) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al buscar medico',
                    errors: err
                });
            }
            if (!medic) {
                return res.status(400).json({
                    ok: false,
                    message: 'El medico de id' + id + 'no existe',
                    errors: { message: 'no existe medico con ese id' }
                });
            }
            res.status(200).json({
                ok: true,
                medic: medic
            });
        });

});

// ================================
// Update Medic
// ================================
app.put('/:id', mdAutentication.verifyToken, (req, res) => {

    var body = req.body;
    var id = req.params.id;

    Medic.findById(id, (err, medic) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medic) {
            return res.status(400).json({
                ok: false,
                message: 'El medico de id' + id + 'no existe',
                errors: { message: 'no existe medico con ese id' }
            });
        }

        medic.name = body.name;
        medic.user = req.user._id;
        medic.hospital = body.hospital;

        medic.save((err, medicSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medic: medicSaved
            });
        });
    });
});

// ================================
// Post Medic
// ================================
app.post('/', mdAutentication.verifyToken, (req, res) => {

    var body = req.body;

    var medic = new Medic({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });

    medic.save((err, medicSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error creating medic',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medic: medicSaved,
            medicToken: req.medic
        });
    });
});

// ================================
// Delete Medic 
// ================================
app.delete('/:id', mdAutentication.verifyToken, (req, res) => {
    var id = req.params.id;
    Medic.findByIdAndRemove(id, (err, medicDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting medic',
                errors: err
            });
        }
        if (!medicDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'There aren\'t medic with id ' + id,
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            medic: medicDeleted
        });
    });
});



module.exports = app;