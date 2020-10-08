const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessSchema = new Schema({
    visited_at: {type: String, required: false},
    IP_address: {type: String, required: false},
    initial: {type: String, required: false},
    cash: {type: String, required: false},
    sales: {type: String, required: false},
    OZ: {type: String, required: false},
    notOZ: {type: String, required: false},
    federal: {type: String, required: false}
});

const tbl_business = mongoose.model('business_tbl', businessSchema, 'business_tbl');

module.exports = tbl_business;