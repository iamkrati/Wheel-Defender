const mongoose = require('mongoose');
// const Driverchallan = require('./driverchallan');

const driverSchema = new mongoose.Schema({
    DLNO: {
        type: String,
        required: true
    },
    results: {
        type: String,
        required: true
    },
    challans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driverchallan'
    }]
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;