const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {type: String, required: false},
    password: {type: String, required: false},
    imageInfo: {type: String, required: false},
    role: {type: Number, required: false},
    active: {type: Boolean, required: false}
});

const tbl_user = mongoose.model('user_tbl', userSchema, 'user_tbl');

module.exports = tbl_user;