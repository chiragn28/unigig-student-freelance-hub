import { Router } from "express";
import multer from "multer";
import { storage } from "../lib/storage.js";
import { BadRequest } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return cb(new Error("Unsupported file type"));
    }
    cb(null, true);
  },
});

// POST /api/uploads/avatar — auth required; one image
router.post("/avatar", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw BadRequest("No file uploaded (field name: 'file')");
    const stored = await storage.upload({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      prefix: `avatars/${req.user!.sub}`,
    });
    res.status(201).json(stored);
  } catch (err) {
    next(err);
  }
});

// POST /api/uploads/portfolio — auth required; one image
router.post("/portfolio", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw BadRequest("No file uploaded (field name: 'file')");
    const stored = await storage.upload({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      prefix: `portfolio/${req.user!.sub}`,
    });
    res.status(201).json(stored);
  } catch (err) {
    next(err);
  }
});

export default router;
