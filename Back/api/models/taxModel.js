const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taxSchema = new Schema({
    visited_at: {type: String, required: false},
    IP_address: {type: String, required: false},
    paid: {type: String, required: false},
    sold: {type: String, required: false},
    rate: {type: String, required: false},
    period: {type: String, required: false},
    OZ: {type: String, required: false},
    notOZ: {type: String, required: false},
    federal: {type: String, required: false},
    state: {type: String, required: false}
});

const tbl_tax = mongoose.model('tax_tbl', taxSchema, 'tax_tbl');

module.exports = tbl_tax;