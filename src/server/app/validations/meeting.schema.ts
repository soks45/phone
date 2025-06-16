import Joi from 'joi';

export default (value: unknown) =>
    Joi.alternatives()
        .try(
            Joi.object({
                name: Joi.string().required(),
                description: Joi.string(),
            })
        )
        .validate(value);
