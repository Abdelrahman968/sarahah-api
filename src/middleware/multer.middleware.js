import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import multer from "multer";
import sharp from "sharp";

export const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 1024 * 1024 * 5,
    files: 1,
  },

  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and JPE images are allowed"), false);
    }
    cb(null, true);
  },
});

export const processImage = (folder = "images") => {
  return async (req, _res, next) => {
    try {
      if (!req.file) {
        return next(new Error("Image is required"));
      }

      const userId = String(req.user.id);
      const uploadDir = path.resolve("uploads", userId, folder);

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const fileName = `${Date.now()}-${crypto.randomUUID()}.webp`;

      const outputPath = path.join(uploadDir, fileName);

      await sharp(req.file.buffer)
        .webp({
          quality: 80,
        })
        .toFile(outputPath);

      const relativePath = path
        .join("uploads", userId, folder, fileName)
        .replaceAll("\\", "/");

      req.processedImage = {
        fileName,
        path: outputPath,
        relativePath,
        mimetype: "image/webp",
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
