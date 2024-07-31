import md5 from 'md5';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {v4 as uuidv4} from 'uuid';
import userValidator from '../utils/userValidate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userController = {
    register(req, res) {
        const body = req.body;

        if (userValidator.register(body)) {
            try {
                body.password = md5(body.password);
                body.id = uuidv4();

                const usersDir = path.join(__dirname, '..', 'users');
                const userFilePath = path.join(usersDir, `${body.email}.json`);

                fs.writeFileSync(userFilePath, JSON.stringify(body, null, 2), 'utf8');

                res.send({"message": "Registration successful"});
            } catch (error) {
                res.status(500).send({"message": "Server error", "error": error.message});
            }
        } else {
            res.status(400).send({"message": "Invalid registration data"});
        }
    },

    login(req, res) {
        const body = req.body;

        if (userValidator.login(body)) {
            try {
                const usersDir = path.join(__dirname, '..', 'users');
                const userFilePath = path.join(usersDir, `${body.email}.json`);

                if (fs.existsSync(userFilePath)) {
                    const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));

                    if (userData.password === md5(body.password)) {
                        res.send({"message": "Login successful"});
                    } else {
                        res.status(401).send({"message": "Invalid password"});
                    }
                } else {
                    res.status(404).send({"message": "User not found"});
                }
            } catch (error) {
                res.status(500).send({"message": "Server error", "error": error.message});
            }
        } else {
            res.status(400).send({"message": "Invalid login data"});
        }
    },

    getUsersList(req, res) {
        try {
            const usersDir = path.join(__dirname, '..', 'users');

            const files = fs.readdirSync(usersDir);
            const users = [];

            files.forEach(file => {
                const filePath = path.join(usersDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const userData = JSON.parse(fileContent);
                users.push(userData);
            });

            res.send(users);
        } catch (error) {
            res.status(500).send({"message": "Server error", "error": error.message});
        }
    },
    getSingleUser(req, res) {
        const body = req.body;

        try {
            const usersDir = path.join(__dirname, '..', 'users');
            const userFilePath = path.join(usersDir, `${body.email}.json`);

            if (fs.existsSync(userFilePath)) {
                const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
                res.send(userData);
            } else {
                res.status(404).send({"message": "User not found"});
            }
        } catch (error) {
            res.status(500).send({"message": "Server error", "error": error.message});
        }
    },

    deleteUser(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).send({ "message": "Email is required" });
        }

        try {
            const usersDir = path.join(__dirname, '..', 'users');
            const tasksDir = path.join(__dirname, '..', 'tasks');

            const userFiles = fs.readdirSync(usersDir);
            const userFilePath = userFiles.find(file => file === `${email}.json`);

            if (!userFilePath) {
                return res.status(404).send({ "message": "User not found" });
            }

            const userFilePathFull = path.join(usersDir, userFilePath);
            const userData = JSON.parse(fs.readFileSync(userFilePathFull, 'utf8'));

            if (userData.tasks) {
                userData.tasks.forEach(taskId => {
                    const taskFilePath = path.join(tasksDir, `${taskId}.json`);
                    if (fs.existsSync(taskFilePath)) {
                        fs.unlinkSync(taskFilePath);
                    }
                });
            }

            fs.unlinkSync(userFilePathFull);

            res.send({ "message": "User and associated tasks deleted successfully" });

        } catch (error) {
            res.status(500).send({ "message": "Server error", "error": error.message });
        }
    },

    updateUser(req, res) {
        const { email, ...updatedData } = req.body;

        if (!email) {
            return res.status(400).send({ "message": "Email is required" });
        }

        if (!userValidator.update(updatedData)) {
            return res.status(400).send({ "message": "Invalid update data" });
        }

        try {
            const usersDir = path.join(__dirname, '..', 'users');
            const userFilePath = path.join(usersDir, `${email}.json`);

            if (fs.existsSync(userFilePath)) {
                const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));

                if (updatedData.password) {
                    updatedData.password = md5(updatedData.password);
                }

                const updatedUserData = { ...userData, ...updatedData };

                fs.writeFileSync(userFilePath, JSON.stringify(updatedUserData, null, 2), 'utf8');

                res.send({ "message": "User updated successfully" });
            } else {
                res.status(404).send({ "message": "User not found" });
            }
        } catch (error) {
            res.status(500).send({ "message": "Server error", "error": error.message });
        }
    }
};

export default userController