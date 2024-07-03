import Joi from 'joi';

export default (value: unknown) =>
    Joi.alternatives()
        .try(
            Joi.object({
                login: Joi.string().required(),
                password_hash: Joi.string().required(),
            }),
            Joi.object({
                email: Joi.string().required(),
            })
        )
        .validate(value);
