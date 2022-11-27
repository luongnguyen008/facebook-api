import express from 'express';
import * as controller from './post.controller.js';
import multer from 'multer';
const upload = multer({dest: './public/uploads/'})
const postRouter = express.Router();

/** GET /api/post */
postRouter.post('/add_post',upload.fields([{
    name: 'images', maxCount: 400
  }, {
    name: 'videos', maxCount: 400
  }]), controller.addPost);
postRouter.post('/get_post', controller.getPost);
postRouter.post('/edit_post',upload.array('images', 400), controller.editPost);
postRouter.post('/delete_post', controller.deletePost);
postRouter.post('/report_post', controller.reportPost);
postRouter.post('/like', controller.like);
postRouter.post('/get_comment', controller.getComment);
postRouter.post('/set_comment', controller.setComment);
postRouter.post('/get_list_posts', controller.getListPosts);
postRouter.post('/check_new_item', controller.checkNewItem);

export default postRouter