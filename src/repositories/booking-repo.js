const { StatusCodes } = require('http-status-codes');
const { Enums } = require('../utils/common');
const { CANCELLED, BOOKED } = Enums.BOOKING_STATUS;

const { Booking } = require('../models');
const CrudRepo = require('./crud-repo');
const { Op } = require('sequelize');

class BookingRepo extends CrudRepo {
    constructor() {
        super(Booking);
    }

    async createBooking(data, transaction) {
        const response = await Booking.create(data, { transaction: transaction });
        console.log('I\'m from repo file');
        return response;
    }

    async get(data, transaction) {
        const response = await this.model.findByPk(data, { transaction: transaction });
        if(!response) {
            throw new AppError('Not able to found the resource', StatusCodes.NOT_FOUND);
        }

        return response;
    }

    async update(id, data, transaction) {
        const [affectedRows] = await this.model.update(data, {
            where: {
                id: id
            }
        }, { transaction: transaction });

        if(affectedRows === 0) {
            throw new AppError('Not able to found the resource', StatusCodes.NOT_FOUND);
        }

        return `You successfully updated and here's the affected rows ${affectedRows}`;
    }

    async cancelOldBookings(timestamp) {
        const response = await Booking.update({ status: CANCELLED}, {
            where: {
                [Op.and]: [
                    {
                        createdAt: {
                            [Op.lt]: timestamp
                        }
                    },
                    {
                        status: {
                            [Op.ne]: BOOKED
                        }
                    },
                    {
                        status: {
                            [Op.ne]: CANCELLED
                        }
                    }
                ]
            }
        });
        return response;
    }
}

module.exports = BookingRepo;