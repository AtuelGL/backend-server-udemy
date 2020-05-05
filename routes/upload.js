var express = require('express');

var Hospital = require('../models/hospital');
var Medic = require('../models/medic');
var User = require('../models/user');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();


// default options
app.use(fileUpload());




app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // Validation of collection types
    var validTypes = ['users', 'medics', 'hospitals'];

    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Colección no válida',
            errors: { message: 'Las colecciones válidas son' + validTypes.join(', ') }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No se ha seleccionado archivo',
            errors: { message: 'Se debe seleccionar una imagen' }
        });
    }

    // Get archive name
    var file = req.files.img;
    var splitFile = file.name.split('.');
    var extensionFile = splitFile[splitFile.length - 1];
    var extensionFileLower = extensionFile.toLowerCase();

    // Validation Extension File
    var validExtensions = ['png', 'gif', 'jpg', 'jpeg'];

    if (validExtensions.indexOf(extensionFileLower) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extension de archivo no válida',
            errors: { message: 'Las extensiones válidas son' + validExtensions.join(', ') }
        });
    }

    // Personalized file name
    var fileName = `${id}-${ new Date().getMilliseconds() }.${extensionFile}`;




    // Move file to temporal path
    var path = `./uploads/${ type }/${ fileName }`;

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                error: err
            });
        }


        uploadByType(type, id, fileName, res);

    });
});


function uploadByType(type, id, fileName, res) {

    if (type === 'users') {
        User.findById(id, (err, user) => {
            if (!user) {
                return res.status(400).json({
                    ok: false,
                    message: 'Usuario inexistente',
                    error: err
                });
            }


            var oldPath = './uploads/users/' + user.img;

            // if old imagen exist, delete it
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) {
                        return res.status(400).json({
                            ok: true,
                            message: 'Error deletting old image',
                            error: err
                        });
                    }
                });
            }

            user.img = fileName;

            user.save((err, userUpdated) => {

                userUpdated.passwd = ':D';
                return res.status(200).json({
                    ok: true,
                    message: 'User image updated',
                    user: userUpdated
                });
            });

        });
    }

    if (type === 'medics') {
        Medic.findById(id, (err, medic) => {

            if (!medic) {
                return res.status(400).json({
                    ok: false,
                    message: 'Medico inexistente',
                    error: err
                });
            }

            var oldPath = './uploads/medics/' + medic.img;

            // if old imagen exist, delete it
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) {
                        return res.status(400).json({
                            ok: true,
                            message: 'Error deletting old image',
                            error: err
                        });
                    }
                });
            }

            medic.img = fileName;

            medic.save((err, medicUpdated) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Medic image updated',
                    medic: medicUpdated
                });
            });

        });
    }

    if (type === 'hospitals') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital inexistente',
                    error: err
                });
            }

            var oldPath = './uploads/hospitals/' + hospital.img;

            // if old imagen exist, delete it
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) {
                        return res.status(400).json({
                            ok: true,
                            message: 'Error deletting old image',
                            error: err
                        });
                    }
                });
            }

            hospital.img = fileName;

            hospital.save((err, hospitalUpdated) => {

                return res.status(200).json({
                    ok: true,
                    message: 'hospital image updated',
                    hospital: hospitalUpdated
                });
            });

        });
    }

}



module.exports = app;