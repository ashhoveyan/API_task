import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const idSchema = Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required()
});

const getTasksSchema = Joi.object({
    page: Joi.number().integer().min(1).max(99999)
});

const taskSchema = Joi.object({
    title: Joi.string().regex(/^[a-zA-Z][a-zA-Z0-9 ]*$/).required(),
    description: Joi.string().required(),
    taskDate: Joi.date().iso().required()
});

const updateTaskSchema = Joi.object({
    title: Joi.string().regex(/^[a-zA-Z][a-zA-Z0-9 ]*$/).optional(),
    description: Joi.string().optional(),
    taskDate: Joi.date().iso().optional()
}).min(1); // Ensure at least one field is provided for update

const validate = {
    getTasks: (req) => {
        const { error, value } = getTasksSchema.validate(req.query, { abortEarly: false });
        return processValidation(error);
    },

    createTask: (req) => {
        const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
        return processValidation(error);
    },

    getSingleTask: (req) => {
        const { error, value } = idSchema.validate(req.params, { abortEarly: false });
        return processValidation(error);
    },

    updateTask: (req) => {
        const { error, value } = updateTaskSchema.validate(req.body, { abortEarly: false });
        return processValidation(error);
    },

    deleteTask: (req) => {
        const { error, value } = idSchema.validate(req.params, { abortEarly: false });
        return processValidation(error);
    }
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
