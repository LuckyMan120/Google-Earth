const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visitorSchema = new Schema({
    visited_at: {type: String, required: false},
    IP_address: {type: String, required: false},
    session: {type: String, required: false},
    polygons: {type: Array, required: false},
    schoolPins: {type: Array, required: false},
    companyPins: {type: Array, required: false},
    taxInfo: {type: Array, required: false},
    businessInfo: {type: Array, required: false}
});

const tbl_visitor = mongoose.model('visitor_tbl', visitorSchema, 'visitor_tbl');

module.exports = tbl_visitor;