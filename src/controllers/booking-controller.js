const { StatusCodes } = require('http-status-codes');

const { BookingService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

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
    try {
        const response = await BookingService.makePayment({
            userId: parseInt(req.body.userId),
            totalCost: parseInt(req.body.totalCost),
            bookingId: parseInt(req.body.bookingId)
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

module.exports = {
    createBooking,
    makePayment
}