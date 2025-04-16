const { StatusCodes } = require('http-status-codes');

const { Booking } = require('../models');
const CrudRepo = require('./crud-repo');

class BookingRepo extends CrudRepo {
    constructor() {
        super(Booking);
    }
}

module.exports = BookingRepo;