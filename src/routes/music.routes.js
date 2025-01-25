import express from 'express';
import { createMusic, deleteMusic, getAllMusic, upload } from '../controllers/music.controller.js';
import multer from 'multer';

const router = express.Router();

router.get('/', getAllMusic);
router.post('/', upload, createMusic);
router.delete('/:id', deleteMusic);

export default router;