import Joi from 'joi';

export default (value: unknown) =>
    Joi.string()
        .guid({ version: ['uuidv4'] })
        .required()
        .validate(value);
