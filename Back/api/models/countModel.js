const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visitorSchema = new Schema({
    display_count: {type: String, required: true, default: 0},
    visitor_count: {type: String, required: false, default: 0},
    previous_visitor: {type: String, required: false, default: 0},
    IPs: {type: Array, required: false}
});

const tbl_count = mongoose.model('count_tbl', visitorSchema, 'count_tbl');

module.exports = tbl_count;