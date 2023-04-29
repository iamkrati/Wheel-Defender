const mongoose = require('mongoose');


const driverchallanSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: true
    }
},{timestamps:true});

const Driverchallan = mongoose.model('Driverchallan', driverchallanSchema);

module.exports = Driverchallan;