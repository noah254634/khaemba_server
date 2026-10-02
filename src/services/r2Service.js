import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const R2_ACCOUNT_ID       = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID   = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME     = process.env.R2_BUCKET_NAME || 'andrew-portfolio-bucket';
const R2_PUBLIC_DOMAIN   = process.env.R2_PUBLIC_DOMAIN || 'https://pub-eec6afc840c14ba19d1c378abb90e686.r2.dev';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads an in-memory buffer to Cloudflare R2 bucket.
 * Automatically compresses images to high-quality WebP format with sharp.
 * Returns the public R2 URL and unique object key.
 */
export const uploadToR2 = async (buffer, originalName, mimeType) => {
  let uploadBuffer = buffer;
  let finalMimeType = mimeType;
  let fileExt = originalName.split('.').pop() || 'png';

  // Automatically compress & convert bitmap images to WebP
  if (mimeType && mimeType.startsWith('image/') && !mimeType.includes('svg')) {
    try {
      uploadBuffer = await sharp(buffer)
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      finalMimeType = 'image/webp';
      fileExt = 'webp';
    } catch (err) {
      console.warn('⚠️ [Sharp Optimization Failed - using original buffer]:', err.message);
    }
  }

  const fileKey = `projects/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    Body: uploadBuffer,
    ContentType: finalMimeType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await s3Client.send(command);

  const publicUrl = `${R2_PUBLIC_DOMAIN}/${fileKey}`;
  return { key: fileKey, url: publicUrl };
};

/**
 * Removes an object from Cloudflare R2 bucket by key.
 */
export const deleteFromR2 = async (fileKey) => {
  if (!fileKey) return;
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });
    await s3Client.send(command);
  } catch (err) {
    console.error(`❌ [R2 Delete Error] Key: ${fileKey}`, err.message);
  }
};
