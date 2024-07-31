import Joi from 'joi';
import {v4 as uuidv4} from 'uuid';

const idSchema = Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required()
});

const registrationSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required()
})

const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});


const validate = {
    register: (req) => {
        const { error, value } = registrationSchema.validate(req.body, { abortEarly: false });
        return processValidation(error);
    },

    login: (req) => {
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
        return processValidation(error);
    },

};

const processValidation = (error) => {
    const fields = {};
    if (error) {
        error.details.forEach(detail => {
            fields[detail.path[0]] = detail.message;
        });
    }
    return {
        fields,
        haveErrors: !!error
    };
};

export default validate;