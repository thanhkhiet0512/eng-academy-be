import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm", "audio/x-m4a"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;

// Use case: validate and upload a file to Cloudflare R2, return the public URL
@Injectable()
export class UploadFileUseCase {
  constructor(private readonly config: ConfigService) {}

  async execute(
    userId: string,
    folder: "images" | "audio",
    file: Express.Multer.File,
  ): Promise<{ publicUrl: string }> {
    const allowedTypes = folder === "images" ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type not allowed: ${file.mimetype}`);
    }
    const maxSize = folder === "images" ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE;
    if (file.size > maxSize) {
      throw new BadRequestException("File too large");
    }

    const accountId = this.config.get<string>("R2_ACCOUNT_ID");
    const accessKeyId = this.config.get<string>("R2_ACCESS_KEY_ID");
    const secretAccessKey = this.config.get<string>("R2_SECRET_ACCESS_KEY");
    const bucket = this.config.get<string>("R2_BUCKET");
    const publicUrl = this.config.get<string>("R2_PUBLIC_URL");

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
      throw new BadRequestException("R2 is not configured");
    }

    const ext = file.originalname.split(".").pop() ?? "bin";
    const key = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const r2 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    return { publicUrl: `${publicUrl}/${key}` };
  }
}
