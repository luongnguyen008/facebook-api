import express from 'express';
import * as controller from './auth.controller.js';

const authRouter = express.Router();

authRouter.post('/signup', controller.signup);
authRouter.post('/login', controller.login);
authRouter.post('/logout', controller.logout);

export default authRouter