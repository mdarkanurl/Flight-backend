const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { BookingRepo } = require('../repositories');
const db = require('../models');
const { ServerConfig } = require('../config');
const { AppError } = require('../utils');

const bookingRepo = new BookingRepo();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_URL}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;
        if(data.numOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }

        const totalBillingAmount = data.numOfSeats * flightData.price;
        const bookingPayload = { ...data, totalCost: totalBillingAmount };
        console.log('Is it here');
        const booking = await bookingRepo.create(bookingPayload, transaction);

        await axios.patch(`${ServerConfig.FLIGHT_URL}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.numOfSeats,
        });

        await transaction.commit();
        return booking;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    createBooking
}