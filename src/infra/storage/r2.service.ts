import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { StorageServicePort, type UploadInput } from "../../domain/upload/ports/storage.service.port";

@Injectable()
export class R2StorageService extends StorageServicePort {
  private client: S3Client | null = null;
  private bucket: string | null = null;
  private basePublicUrl: string | null = null;

  constructor(private readonly config: ConfigService) {
    super();
  }

  private getClient(): { client: S3Client; bucket: string; publicUrl: string } {
    if (!this.client) {
      const accountId = this.config.getOrThrow<string>("R2_ACCOUNT_ID");
      this.bucket = this.config.getOrThrow<string>("R2_BUCKET");
      this.basePublicUrl = this.config.getOrThrow<string>("R2_PUBLIC_URL");
      this.client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.config.getOrThrow<string>("R2_ACCESS_KEY_ID"),
          secretAccessKey: this.config.getOrThrow<string>("R2_SECRET_ACCESS_KEY"),
        },
      });
    }
    return { client: this.client, bucket: this.bucket!, publicUrl: this.basePublicUrl! };
  }

  async upload(input: UploadInput): Promise<void> {
    const { client, bucket } = this.getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: input.key,
        Body: input.buffer,
        ContentType: input.contentType,
        ContentLength: input.contentLength,
      }),
    );
  }

  getPublicUrl(key: string): string {
    const { publicUrl } = this.getClient();
    return `${publicUrl}/${key}`;
  }
}
