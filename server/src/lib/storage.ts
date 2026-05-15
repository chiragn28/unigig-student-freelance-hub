import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../config.js";

// =========================================================================
// Storage interface
// Swap implementations (local <-> S3/R2) without changing route code.
// =========================================================================

export interface StoredFile {
  key: string;       // opaque identifier
  url: string;       // publicly accessible URL
  size: number;
  mimeType: string;
}

export interface FileStorage {
  upload(input: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    prefix?: string;
  }): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
}

// ---- Local storage (dev + fallback) ----
class LocalFileStorage implements FileStorage {
  private dir = path.resolve(env.STORAGE_LOCAL_DIR);

  async upload(input: { buffer: Buffer; originalName: string; mimeType: string; prefix?: string }): Promise<StoredFile> {
    await fs.mkdir(this.dir, { recursive: true });
    const ext = path.extname(input.originalName) || mimeExt(input.mimeType);
    const safeRandom = crypto.randomBytes(16).toString("hex");
    const subdir = input.prefix ? input.prefix.replace(/[^a-z0-9_-]/gi, "") : "";
    const filename = `${safeRandom}${ext}`;
    const relKey = path.posix.join(subdir, filename);
    const absPath = path.join(this.dir, subdir, filename);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, input.buffer);
    return {
      key: relKey,
      url: this.publicUrl(relKey),
      size: input.buffer.byteLength,
      mimeType: input.mimeType,
    };
  }

  async delete(key: string): Promise<void> {
    const abs = path.join(this.dir, key);
    await fs.unlink(abs).catch(() => undefined);
  }

  publicUrl(key: string): string {
    return `${env.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
  }
}

// ---- S3 / R2 (placeholder) ----
// Wire up @aws-sdk/client-s3 here when you go to production.
class S3FileStorage implements FileStorage {
  async upload(): Promise<StoredFile> {
    throw new Error(
      "S3 storage not implemented yet. Install @aws-sdk/client-s3 and complete server/src/lib/storage.ts.",
    );
  }
  async delete(): Promise<void> {
    throw new Error("S3 storage not implemented yet.");
  }
  publicUrl(key: string): string {
    return `${env.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
  }
}

function mimeExt(mime: string): string {
  switch (mime) {
    case "image/jpeg": return ".jpg";
    case "image/png": return ".png";
    case "image/webp": return ".webp";
    case "image/gif": return ".gif";
    case "image/svg+xml": return ".svg";
    default: return "";
  }
}

function buildStorage(): FileStorage {
  switch (env.STORAGE_DRIVER) {
    case "s3":
      return new S3FileStorage();
    case "local":
    default:
      return new LocalFileStorage();
  }
}

export const storage: FileStorage = buildStorage();
