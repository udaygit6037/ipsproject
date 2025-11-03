import express from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment
} from '../controllers/forumController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createPost);

router.post('/create', authenticate, createPost);

router.get('/', authenticate, getAllPosts);

router.get('/:id', authenticate, getPostById);

router.put('/:id', authenticate, updatePost);

router.delete('/:id', authenticate, deletePost);

router.post('/:id/like', authenticate, likePost);

router.post('/:id/comments', authenticate, addComment);

router.delete('/:id/comments/:commentId', authenticate, deleteComment);

export default router;
