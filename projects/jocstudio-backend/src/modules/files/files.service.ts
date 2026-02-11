import { randomUUID } from 'crypto';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import { join, extname } from 'path';
import { pipeline } from 'stream/promises';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { BadRequestError, NotFoundError } from '../../lib/errors.js';
import { createChildLogger } from '../../lib/logger.js';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, type UploadedFile } from './files.schema.js';

const logger = createChildLogger('files-service');

// Ensure upload directory exists
const uploadDir = env.UPLOAD_DIR;
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

export interface MultipartFile {
  filename: string;
  mimetype: string;
  file: NodeJS.ReadableStream;
  toBuffer: () => Promise<Buffer>;
}

export async function uploadFile(
  file: MultipartFile,
  userId: string
): Promise<UploadedFile> {
  logger.debug({ filename: file.filename, mimetype: file.mimetype }, 'Uploading file');

  // Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestError(
      `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  // Generate unique filename
  const id = randomUUID();
  const ext = extname(file.filename) || getExtension(file.mimetype);
  const filename = `${id}${ext}`;
  const filepath = join(uploadDir, filename);

  // Save file based on storage provider
  if (env.STORAGE_PROVIDER === 'local') {
    await saveLocalFile(file, filepath);
  } else {
    // For Supabase/S3, implement here
    throw new BadRequestError('Storage provider not implemented');
  }

  // Get file size
  const buffer = await file.toBuffer();
  const size = buffer.length;

  if (size > MAX_FILE_SIZE) {
    // Clean up
    await unlink(filepath).catch(() => {});
    throw new BadRequestError(`File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Save to database
  const fileRecord = await prisma.fileUpload.create({
    data: {
      id,
      filename,
      originalName: file.filename,
      mimeType: file.mimetype,
      size,
      path: filepath,
      url: `/uploads/${filename}`,
      provider: env.STORAGE_PROVIDER,
      uploadedById: userId,
    },
  });

  logger.info({ fileId: id }, 'File uploaded successfully');

  return {
    id: fileRecord.id,
    filename: fileRecord.filename,
    originalName: fileRecord.originalName,
    mimeType: fileRecord.mimeType,
    size: fileRecord.size,
    path: fileRecord.path,
    url: fileRecord.url ?? `/uploads/${filename}`,
  };
}

async function saveLocalFile(
  file: MultipartFile,
  filepath: string
): Promise<void> {
  const writeStream = createWriteStream(filepath);
  await pipeline(file.file, writeStream);
}

function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
  };
  return extensions[mimeType] || '';
}

export async function getFile(fileId: string): Promise<UploadedFile> {
  const file = await prisma.fileUpload.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new NotFoundError('File not found');
  }

  return {
    id: file.id,
    filename: file.filename,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    path: file.path,
    url: file.url ?? `/uploads/${file.filename}`,
  };
}

export async function deleteFile(fileId: string, userId: string): Promise<void> {
  const file = await prisma.fileUpload.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new NotFoundError('File not found');
  }

  if (file.uploadedById !== userId) {
    throw new BadRequestError('You do not have permission to delete this file');
  }

  // Delete from storage
  if (env.STORAGE_PROVIDER === 'local') {
    await unlink(file.path).catch(() => {});
  }

  // Delete from database
  await prisma.fileUpload.delete({
    where: { id: fileId },
  });

  logger.info({ fileId }, 'File deleted');
}
