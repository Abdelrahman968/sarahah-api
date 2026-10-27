import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import multer from "multer";
import sharp from "sharp";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

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

const AvatarFileValidator = z
  .object({
    mimetype: z.enum(ACCEPTED_IMAGE_TYPES),
    size: z.number().positive().max(MAX_FILE_SIZE),
    buffer: z.instanceof(Buffer),
  })
  .refine((file) => file.buffer.length > 0, {
    message: "Image file cannot be empty.",
  });

export const processImage = (folder = "images") => {
  return async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new Error("Image is required"));
      }

      const result = AvatarFileValidator.safeParse(req.file);

      if (!result.success) {
        return res.status(400).json({
          message: "Invalid image file",
          errors: result.error.issues,
        });
      }

      const image = sharp(req.file.buffer, {
        limitInputPixels: 16_000_000,
      });

      const metadata = await image.metadata();

      if (!["jpeg", "png"].includes(metadata.format)) {
        return res.status(400).json({
          message: "Only valid JPEG and PNG images are allowed",
        });
      }

      const userId = String(req.user.id);
      const uploadDir = path.resolve("uploads", userId, folder);

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const fileName = `${crypto.randomUUID()}.webp`;

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
