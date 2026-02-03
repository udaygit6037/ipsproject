import express from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  getForumStats
} from '../controllers/forumController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createPost);

router.post('/create', authenticate, createPost);

router.get('/stats', optionalAuthenticate, getForumStats);

router.get('/', optionalAuthenticate, getAllPosts);

// This route must come after /stats to avoid conflicts
router.get('/:id', optionalAuthenticate, getPostById);

router.put('/:id', authenticate, updatePost);

router.delete('/:id', authenticate, deletePost);

router.post('/:id/like', authenticate, likePost);

router.post('/:id/comments', authenticate, addComment);

router.delete('/:id/comments/:commentId', authenticate, deleteComment);

export default router;
