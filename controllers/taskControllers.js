import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import taskValidator from '../utils/taskValidate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const taskController = {
    createTask(req, res) {
        const { title, description, userEmail } = req.body;

        if (!title || !description || !userEmail) {
            return res.status(400).send({ "message": "All fields are required" });
        }

        if (!taskValidator.createTask(req.body)) {
            return res.status(400).send({ "message": "Invalid task data" });
        }

        try {
            const usersDir = path.join(__dirname, '..', 'users');
            const tasksDir = path.join(__dirname, '..', 'tasks');

            if (!fs.existsSync(tasksDir)) {
                fs.mkdirSync(tasksDir);
            }

            const userFilePath = path.join(usersDir, `${userEmail}.json`);
            if (!fs.existsSync(userFilePath)) {
                return res.status(404).send({ "message": "User not found" });
            }

            const taskId = uuidv4();

            const taskData = {
                id: taskId,
                title: title,
                description: description,
                userEmail: userEmail
            };

            const filePath = path.join(tasksDir, `${taskId}.json`);

            fs.writeFileSync(filePath, JSON.stringify(taskData, null, 2), 'utf8');

            const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
            if (!userData.tasks) {
                userData.tasks = [];
            }
            userData.tasks.push(taskId);

            fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2), 'utf8');

            res.send({ "message": "Task created and associated with user successfully", "task": taskData });
        } catch (error) {
            res.status(500).send({ "message": "Server error", "error": error.message });
        }
    },

    getTasks(req, res) {
        const userId = req.params.id;
        const tasksDir = path.join(__dirname, '..', 'tasks');

        try {
            if (userId) {
                const usersDir = path.join(__dirname, '..', 'users');
                const userFilePath = path.join(usersDir, `${userId}.json`);

                if (!fs.existsSync(userFilePath)) {
                    return res.status(404).send({ "message": "User not found" });
                }

                const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
                if (!userData.tasks || userData.tasks.length === 0) {
                    return res.status(404).send({ "message": "No tasks found for this user" });
                }

                const userTasks = userData.tasks.map(taskId => {
                    const taskFilePath = path.join(tasksDir, `${taskId}.json`);
                    if (fs.existsSync(taskFilePath)) {
                        return JSON.parse(fs.readFileSync(taskFilePath, 'utf8'));
                    }
                }).filter(task => task);

                res.send(userTasks);

            } else {
                const taskFiles = fs.readdirSync(tasksDir);
                const allTasks = taskFiles.map(file => {
                    const filePath = path.join(tasksDir, file);
                    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
                });

                res.send(allTasks);
            }
        } catch (error) {
            res.status(500).send({ "message": "Server error", "error": error.message });
        }
    },

    getSingleTask(req, res) {
        const taskId = req.params.id;
        const tasksDir = path.join(__dirname, '..', 'tasks');
        const taskFilePath = path.join(tasksDir, `${taskId}.json`);

        try {
            if (fs.existsSync(taskFilePath)) {
                const taskData = JSON.parse(fs.readFileSync(taskFilePath, 'utf8'));
                res.send(taskData);
            } else {
                res.status(404).send({ "message": "Task not found" });
            }
        } catch (error) {
            res.status(500).send({ "message": "Server error", "error": error.message });
        }

    },

    deleteTask(req, res) {
        const taskId = req.params.id;
        const tasksDir = path.join(__dirname, '..', 'tasks');
        const taskFilePath = path.join(tasksDir, `${taskId}.json`);

        try {
            if (fs.existsSync(taskFilePath)) {
                fs.unlinkSync(taskFilePath);
                res.send({ "message": "Task deleted successfully" });
            } else {
                res.status(404).send({ "message": "Task not found" });
            }
        } catch (error) {
            res.status( 500).send({ "message": "Server error", "error": error.message });
        }
    },

    updateTask(req, res) {
        const { id, ...updatedData } = req.body;

        if (!id) {
            return res.status(400).send({ "message": "Task ID is required" });
        }

        if (!taskValidator.updateTask(updatedData)) {
            return res.status(400).send({ "message": "Invalid task data" });
        }

        try {
            const tasksDir = path.join(__dirname, '..', 'tasks');
            const taskFilePath = path.join(tasksDir, `${id}.json`);

            if (fs.existsSync(taskFilePath)) {
                const taskData = JSON.parse(fs.readFileSync(taskFilePath, 'utf8'));

                const updatedTaskData = { ...taskData, ...updatedData };

                fs.writeFileSync(taskFilePath, JSON.stringify(updatedTaskData, null, 2), 'utf8');

                res.send({ "message": "Task updated successfully", "task": updatedTaskData });
            } else {
                res.status(404).send({ "message": "Task not found" });
            }
        } catch (error) {
            res.status(500).send({ "message": "Server error", "error": error.message });
        }
    }
}
export default taskController;
