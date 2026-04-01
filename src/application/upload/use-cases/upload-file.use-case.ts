import { Injectable } from "@nestjs/common";
import { StorageServicePort } from "../../../domain/upload/ports/storage.service.port";
import { AppError } from "../../../common/errors/app.error";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm", "audio/x-m4a"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;

@Injectable()
export class UploadFileUseCase {
  constructor(private readonly storage: StorageServicePort) {}

  async execute(
    userId: string,
    folder: "images" | "audio",
    file: Express.Multer.File,
  ): Promise<{ publicUrl: string }> {
    const allowedTypes = folder === "images" ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
    if (!allowedTypes.includes(file.mimetype)) {
      throw AppError.badRequest(`File type not allowed: ${file.mimetype}`);
    }

    const maxSize = folder === "images" ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE;
    if (file.size > maxSize) {
      throw AppError.badRequest("File too large");
    }

    const ext = file.originalname.split(".").pop() ?? "bin";
    const key = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await this.storage.upload({
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
      contentLength: file.size,
    });

    return { publicUrl: this.storage.getPublicUrl(key) };
  }
}
