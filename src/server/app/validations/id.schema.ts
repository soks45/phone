import Joi from 'joi';

export default (value: unknown) => Joi.number().integer().positive().required().validate(value);
