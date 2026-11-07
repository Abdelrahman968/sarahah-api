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

const hasSupportedImageSignature = (buffer) => {
  const jpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return jpeg || png;
};

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

      if (!hasSupportedImageSignature(req.file.buffer)) {
        return res.status(400).json({ message: "Image signature is invalid or unsupported" });
      }

      const image = sharp(req.file.buffer, {
        limitInputPixels: 16_000_000,
      });

      let metadata;
      try {
        metadata = await image.metadata();
      } catch {
        return res.status(400).json({ message: "Invalid or corrupted image file" });
      }

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

      let convertedImage;
      try {
        convertedImage = await sharp(req.file.buffer, {
          limitInputPixels: 16_000_000,
        })
          .webp({ quality: 80 })
          .toBuffer();
      } catch {
        return res.status(400).json({ message: "Invalid or corrupted image file" });
      }

      await fs.writeFile(outputPath, convertedImage);

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
