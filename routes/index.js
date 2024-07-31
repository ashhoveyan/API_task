import express from 'express';
import taskController from '../controllers/taskControllers.js';
const router = express.Router();




router.post('/create', taskController.createTask );
router.get('/list/:userId?', taskController.getTasks );
router.get('/single/:id', taskController.getSingleTask );
router.delete('/delete/:id', taskController.deleteTask );
router.put('/update/:id', taskController.updateTask );


export default router