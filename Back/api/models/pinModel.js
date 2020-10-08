const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pinSchema = new Schema({
    visited_at: {type: String, required: false},
    IP_address: {type: String, required: false},
    session: {type: String, required: false},
    schools: {type: Array, required: false},
    companies: {type: Array, required: false}
});

const tbl_pin = mongoose.model('pin_tbl', pinSchema, 'pin_tbl');

module.exports = tbl_pin;