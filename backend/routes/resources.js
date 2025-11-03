import express from 'express';
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  likeResource
} from '../controllers/resourceController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('counsellor', 'admin'), upload.single('file'), createResource);

router.get('/', authenticate, getAllResources);

router.get('/:id', authenticate, getResourceById);

router.put('/:id', authenticate, updateResource);

router.delete('/:id', authenticate, deleteResource);

router.post('/:id/like', authenticate, likeResource);

export default router;
