import express from 'express';

import authRouter from './auth/auth.route.js';
import postRouter from './post/post.route.js';

const services = express.Router();

services.use('/auth', authRouter);
services.use('/post', postRouter);

export default services