const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const earthSchema = new Schema({
    state: {type: String, required: false},
    polygons: {type: Array, required: false}
});

const tbl_earth = mongoose.model('map_tbl', earthSchema, 'map_tbl');

module.exports = tbl_earth;