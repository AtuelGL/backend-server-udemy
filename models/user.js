var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};



var userSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El email es necesario'] },
    passwd: { type: String, required: [true, 'La contraseña es necesariao'] },
    img: { type: String },
    role: { type: String, required: true, default: 'USER_ROLE', enum: validRoles },
    google: { type: Boolean, default: false }
});

userSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('User', userSchema);