const { StatusCodes } = require('http-status-codes');

const { Booking } = require('../models');
const CrudRepo = require('./crud-repo');

class BookingRepo extends CrudRepo {
    constructor() {
        super(Booking);
    }

    async createBooking(data, transaction) {
        const response = await Booking.create(data, { transaction: transaction });
        console.log('I\'m from repo file');
        return response;
    }
}

module.exports = BookingRepo;