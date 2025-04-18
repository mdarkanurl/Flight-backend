const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { BookingRepo } = require('../repositories');
const db = require('../models');
const { ServerConfig } = require('../config');
const { AppError } = require('../utils');
const { Enums } = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

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

async function makePayment( data ) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepo.get(data.bookingId);

        if(bookingDetails.status === CANCELLED) {
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST); 
        }

        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();

        if(bookingTime - currentTime > 300000) {
            await bookingRepo.update(data.bookingId, { status: CANCELLED }, transaction);
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
        }

        if(bookingDetails.totalCost !== data.totalCost) {
            throw new AppError('The amount of the payment doesn\'t match', StatusCodes.BAD_REQUEST);
        }

        if(bookingDetails.userId !== data.userId) {
            throw new AppError('The user corresponding to the booking doesn\'t match', StatusCodes.BAD_REQUEST);
        }

        await bookingRepo.update(data.bookingId, { status: BOOKED }, transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    createBooking,
    makePayment
}