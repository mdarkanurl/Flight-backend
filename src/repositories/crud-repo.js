const { StatusCodes } = require('http-status-codes');

const { Logger } = require('../config');
const AppError = require('../utils/errors/app.error');

class CrudRepo {
    constructor(model) {
        this.model = model
    }

    async create(data) {
        const response = await this.model.create(data);
        return response;
    }

    async destroy(data) {
        const response = await this.model.destroy({
            where: {
                id: data
            }
        });

        if(!response) {
            throw new AppError('Not able to found the resource', StatusCodes.NOT_FOUND);
        }
        return `You've successfully delete ${response} data`;
    }

    async get(data) {
        const response = await this.model.findByPk(data);
        // console.log(response)

        if(!response) {
            throw new AppError('Not able to found the resource', StatusCodes.NOT_FOUND);
        }

        return response;
    }

    async getAll() {
        const response = await this.model.findAll();
        return response;
    }

    async update(data, id) {
        const [affectedRows] = await this.model.update(data, {
            where: {
                id: id
            }
        });

        if(affectedRows === 0) {
            throw new AppError('Not able to found the resource', StatusCodes.NOT_FOUND);
        }

        return `You successfully updated and here's the affected rows ${affectedRows}`;
    }
}

module.exports = CrudRepo