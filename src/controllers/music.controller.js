import Music from "../models/music.js";
import messages from "../utils/responseMessages.js";
import multer from "multer";
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${path.extname(file.originalname)}`); 
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['audio/mpeg', 'audio/wav'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos de audio.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("music");

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: "error",
      message: `Error al subir el archivo: ${err.message}`,
    });
  }
  next(err);
};

export const getAllMusic = async (req, res) => {
  try {
    const musics = await Music.find();
    res.status(200).json(messages.success("Lista de músicas", musics));
  } catch (error) {
    res.status(500).json(messages.error("Error al obtener las músicas", error));
  }
};

export const getMusicById = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res.status(404).json(messages.error("Música no encontrada"));
    }
    res.status(200).json(messages.success("Música encontrada", music));
  } catch (error) {
    res.status(500).json(messages.error("Error al buscar la música", error));
  }
};

export const createMusic = async (req, res) => {
  const { title, artist, image, video } = req.body;
  const musicFile = req.file?.filename; 
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    errors.push("El título es obligatorio y debe tener al menos 3 caracteres.");
  }

  if (!artist || typeof artist !== "string" || artist.trim().length < 2) {
    errors.push("El artista es obligatorio y debe tener al menos 2 caracteres.");
  }

  if (!image || typeof image !== "string") {
    errors.push("La imagen es obligatoria y debe ser una URL válida.");
  }

  if (!video || typeof video !== "string") {
    errors.push("El video es obligatorio y debe ser una URL válida.");
  }

  if (!musicFile) {
    errors.push("La música es obligatoria y debe ser un archivo válido.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "error",
      messages: errors,
      data: null,
    });
  }

  try {
    const newMusic = new Music({
      title,
      artist,
      image,
      video,
      music: musicFile,
    });
    await newMusic.save();
    res.status(201).json({
      status: "success",
      message: "Música creada exitosamente",
      data: newMusic,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error al guardar la música",
      data: err.message,
    });
  }
};

export const updateMusic = async (req, res) => {
  try {
    const updatedMusic = await Music.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMusic) {
      return res.status(404).json(messages.error("Música no encontrada"));
    }
    res.status(200).json(messages.success("Música actualizada", updatedMusic));
  } catch (error) {
    res.status(500).json(messages.error("Error al actualizar la música", error));
  }
};

export const deleteMusic = async (req, res) => {
  try {
    const deletedMusic = await Music.findByIdAndDelete(req.params.id);
    if (!deletedMusic) {
      return res.status(404).json(messages.error("Música no encontrada"));
    }
    res.status(200).json(messages.success("Música eliminada", deletedMusic));
  } catch (error) {
    res.status(500).json(messages.error("Error al eliminar la música", error));
  }
};

import express from 'express';
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export { upload, handleMulterError };
