var express = require('express');

var mdAutentication = require('../middlewares/autentication');
var app = express();

var Hospital = require('../models/hospital');

// ================================
// Get Hospital
// ================================

app.get('/', (req, res, next) => {

    var from = req.query.from || 0;
    from = Number(from);

    Hospital.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .exec(
            (err, hospitals) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al obtener hospital',
                        errors: err
                    });
                }
                Hospital.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        hospitals: hospitals,
                        total: count
                    });
                });
            });
});

// ================================
// Update Hospital
// ================================
app.put('/:id', mdAutentication.verifyToken, (req, res) => {

    var body = req.body;
    var id = req.params.id;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital de id' + id + 'no existe',
                errors: { message: 'no existe hospital con ese id' }
            });
        }

        hospital.name = body.name;
        hospital.user = req.user._id;

        hospital.save((err, hospitalSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                user: hospitalSaved
            });
        });
    });
});

// ================================
// Create Hospital
// ================================
app.post('/', mdAutentication.verifyToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        user: req.user._id
    });

    hospital.save((err, hospitalSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error creating hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalSaved
        });
    });
});

// ================================
// Delete Hospital 
// ================================
app.delete('/:id', mdAutentication.verifyToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting hospital',
                errors: err
            });
        }
        if (!hospitalDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'There aren\'t hospital with id ' + id,
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalDeleted
        });
    });
});


// ==========================================
// Get Hospital by ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('user', 'name img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'El hospital con el id ' + id + 'no existe',
                    errors: {
                        message: 'No existe un hospital con ese ID '
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});


module.exports = app;