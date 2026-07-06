import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('minio.bucket') ?? 'all-in-one';
    this.client = new Minio.Client({
      endPoint: this.config.get<string>('minio.endPoint') ?? 'localhost',
      port: this.config.get<number>('minio.port') ?? 9000,
      useSSL: this.config.get<boolean>('minio.useSSL') ?? false,
      accessKey: this.config.get<string>('minio.accessKey') ?? 'minioadmin',
      secretKey: this.config.get<string>('minio.secretKey') ?? 'minioadmin',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) await this.client.makeBucket(this.bucket, 'eu-central-1');
    } catch (e) {
      this.logger.warn(`MinIO not reachable at startup - storage will retry on use. (${(e as Error).message})`);
    }
  }

  async upload(objectName: string, buffer: Buffer, contentType = 'application/octet-stream') {
    await this.client.putObject(this.bucket, objectName, buffer, buffer.length, { 'Content-Type': contentType });
    return { bucket: this.bucket, objectName };
  }

  presignedGet(objectName: string, expirySeconds = 3600) {
    return this.client.presignedGetObject(this.bucket, objectName, expirySeconds);
  }
}
