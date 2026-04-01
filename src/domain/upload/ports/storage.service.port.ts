export type UploadInput = {
  key: string;
  buffer: Buffer;
  contentType: string;
  contentLength: number;
};

export abstract class StorageServicePort {
  abstract upload(input: UploadInput): Promise<void>;
  abstract getPublicUrl(key: string): string;
}
