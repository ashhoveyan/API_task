import express from "express";

const router = express.Router();

import userController from '../controllers/userControllers.js';


router.post('/registration', userController.register);
router.post('/login', userController.login);
router.get('/list', userController.getUsersList);
router.get('/single', userController.getSingleUser);
router.delete('/delete', userController.deleteUser, );
router.delete('/update', userController.updateUser, );

export default router;