const { StatusCodes } = require('http-status-codes');

const { BookingService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

const inMemDB = {};

const createBooking = async (req, res) => {
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            numOfSeats: req.body.numOfSeats
        });

        SuccessResponse.data = response;
        
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
                .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

const makePayment = async (req, res) => {
    const idempotencyKey = req.headers['x-idempotency-key'];

    if(!idempotencyKey) {
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: 'idempotency-key missing' });
    }

    if(inMemDB[idempotencyKey]) {
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: 'Can\'t retry on a successful payment' });
    }
    
    try {
        const response = await BookingService.makePayment({
            userId: parseInt(req.body.userId),
            totalCost: parseInt(req.body.totalCost),
            bookingId: parseInt(req.body.bookingId)
        });
        inMemDB[idempotencyKey] = idempotencyKey;
        SuccessResponse.data = response;
        
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
                .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    makePayment
}