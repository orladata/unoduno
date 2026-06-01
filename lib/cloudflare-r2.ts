/**
 * Cloudflare R2 Storage Service
 *
 * Gerencia uploads e downloads de áudios MP3 no Cloudflare R2.
 * R2 é S3-compatible, então usamos AWS SDK.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

interface UploadOptions {
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

interface DownloadResult {
  body: Uint8Array;
  contentType?: string;
  metadata?: Record<string, string>;
}

class CloudflareR2Service {
  private client: S3Client;
  private config: R2Config;

  constructor(config: R2Config) {
    this.config = config;

    // Configurar S3Client para Cloudflare R2
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Upload de arquivo (áudio) para R2
   */
  async uploadFile(
    buffer: Buffer | Uint8Array,
    options: UploadOptions
  ): Promise<{ key: string; etag?: string; url: string }> {
    try {
      console.log(`[R2] Iniciando upload: ${options.key}`);

      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.config.bucketName,
          Key: options.key,
          Body: buffer,
          ContentType: options.contentType || 'audio/mpeg',
          Metadata: options.metadata,
        },
      });

      const result = await upload.done();

      const url = this.getPublicUrl(options.key);

      console.log(`[R2] ✅ Upload concluído: ${options.key}`);
      console.log(`[R2] URL: ${url}`);

      return {
        key: options.key,
        etag: result.ETag,
        url,
      };
    } catch (error) {
      console.error(`[R2] ❌ Erro ao fazer upload: ${error}`);
      throw error;
    }
  }

  /**
   * Download de arquivo do R2
   */
  async downloadFile(key: string): Promise<DownloadResult> {
    try {
      console.log(`[R2] Iniciando download: ${key}`);

      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);

      // Converter stream para buffer
      const chunks: Uint8Array[] = [];
      
      if (response.Body) {
        // S3 Body pode ser um stream Node.js ou Web Stream
        const stream = response.Body as any;
        
        if (typeof stream[Symbol.asyncIterator] === 'function') {
          // É um stream iterável
          for await (const chunk of stream) {
            chunks.push(
              chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk)
            );
          }
        } else if (stream.getReader) {
          // É um ReadableStream web
          const reader = stream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
        } else if (stream.read) {
          // É um stream Node.js
          let chunk;
          while ((chunk = stream.read()) !== null) {
            chunks.push(
              chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk)
            );
          }
        }
      }

      const buffer = Buffer.concat(chunks);

      console.log(`[R2] ✅ Download concluído: ${key} (${buffer.length} bytes)`);

      return {
        body: buffer,
        contentType: response.ContentType,
        metadata: response.Metadata,
      };
    } catch (error) {
      console.error(`[R2] ❌ Erro ao fazer download: ${error}`);
      throw error;
    }
  }

  /**
   * Listar arquivos no R2
   */
  async listFiles(prefix?: string): Promise<
    Array<{
      key: string;
      size: number;
      lastModified?: Date;
      url: string;
    }>
  > {
    try {
      console.log(`[R2] Listando arquivos (prefix: ${prefix || 'nenhum'})`);

      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: prefix,
      });

      const response = await this.client.send(command);

      const files = (response.Contents || []).map((obj) => ({
        key: obj.Key!,
        size: obj.Size || 0,
        lastModified: obj.LastModified,
        url: this.getPublicUrl(obj.Key!),
      }));

      console.log(`[R2] ✅ ${files.length} arquivo(s) encontrado(s)`);

      return files;
    } catch (error) {
      console.error(`[R2] ❌ Erro ao listar arquivos: ${error}`);
      throw error;
    }
  }

  /**
   * Deletar arquivo do R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      console.log(`[R2] Deletando arquivo: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.client.send(command);

      console.log(`[R2] ✅ Arquivo deletado: ${key}`);
    } catch (error) {
      console.error(`[R2] ❌ Erro ao deletar arquivo: ${error}`);
      throw error;
    }
  }

  /**
   * Gerar URL pública para um arquivo
   */
  getPublicUrl(key: string): string {
    // Formato: https://bucketname.accountid.r2.cloudflarestorage.com/key
    // Ou se tiver custom domain: https://custom-domain.com/key
    const customDomain = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN;

    if (customDomain) {
      return `${customDomain}/${key}`;
    }

    return `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com/${key}`;
  }

  /**
   * Fechar cliente
   */
  async close(): Promise<void> {
    this.client.destroy();
  }
}

/**
 * Factory para criar instância do serviço
 */
export function createR2Service(): CloudflareR2Service {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      'Cloudflare R2 não configurado. Verifique as variáveis de ambiente.'
    );
  }

  return new CloudflareR2Service({
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
  });
}

export type { R2Config, UploadOptions, DownloadResult };
export default CloudflareR2Service;
