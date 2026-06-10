/**
 * S3-compatible storage utility for Railway bucket.
 *
 * All plant images live under the `florafile/` prefix in the bucket.
 * Key structure:
 *   - Plant profile images: florafile/plants/{plantId}/profile/{uuid}.webp
 *   - History snapshots:    florafile/plants/{plantId}/history/{uuid}.webp
 *
 * Uses Railway's standard AWS_ environment variable names, which are
 * auto-injected when the bucket is connected via the Railway dashboard.
 * The AWS SDK v3 automatically picks up AWS_ACCESS_KEY_ID,
 * AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION from the environment.
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// ─── S3 Client Singleton ─────────────────────────────────────────────────────

/** Lazily-initialized S3 client — avoids initialization errors during build. */
let _client: S3Client | null = null;
export function getClient(): S3Client {
  if (!_client) {
    _client = new S3Client({
      // AWS SDK v3 auto-detects AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY,
      // but reads AWS_REGION — not AWS_DEFAULT_REGION (what Railway injects).
      // Pass region explicitly to bridge that gap.
      endpoint: process.env.AWS_ENDPOINT_URL,
      region: process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "auto",
      forcePathStyle: true, // Required for most S3-compatible providers
    });
  }
  return _client;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Upload an image buffer to the bucket and return its public URL.
 *
 * @param buffer      - Raw image bytes
 * @param key         - Full S3 key (e.g. "florafile/plants/abc/profile/uuid.webp")
 * @param contentType - MIME type (e.g. "image/webp")
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const client = getClient();
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Tigris buckets are private by default; ACL public-read is not implemented
    }),
  );

  return getPublicUrl(key);
}

/**
 * Delete an image from the bucket by its key.
 */
export async function deleteImage(key: string): Promise<void> {
  const client = getClient();
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

/**
 * Construct the public URL for an object in the bucket.
 * We proxy through our Next.js API route because Tigris buckets are private.
 */
export function getPublicUrl(key: string): string {
  return `/api/storage/${key}`;
}

/**
 * Extract the S3 key from a public bucket URL.
 * Handles both the local proxy URLs and legacy external URLs.
 */
export function extractKeyFromUrl(url: string): string | null {
  // Check new proxy URL format
  const proxyPrefix = "/api/storage/";
  if (url.startsWith(proxyPrefix)) {
    return url.slice(proxyPrefix.length);
  }

  // Check legacy external URL format
  const endpoint = process.env.AWS_ENDPOINT_URL;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!endpoint || !bucketName) return null;

  const legacyPrefix = `${endpoint}/${bucketName}/`;
  if (url.startsWith(legacyPrefix)) {
    return url.slice(legacyPrefix.length);
  }

  return null;
}

// ─── Key Builders ────────────────────────────────────────────────────────────

/** Generate an S3 key for a plant's profile image. */
export function buildProfileKey(plantId: string, ext = "webp"): string {
  return `florafile/plants/${plantId}/profile/${crypto.randomUUID()}.${ext}`;
}

/** Generate an S3 key for a plant history snapshot image. */
export function buildHistoryKey(plantId: string, ext = "webp"): string {
  return `florafile/plants/${plantId}/history/${crypto.randomUUID()}.${ext}`;
}

/**
 * Parse a base64 data URL into its components.
 * Returns null if the data URL is malformed.
 */
export function parseDataUrl(dataUrl: string): {
  base64: string;
  mimeType: string;
  ext: string;
  buffer: Buffer;
} | null {
  const matches = dataUrl.match(/^data:(image\/([a-zA-Z0-9]+));base64,(.+)$/);
  if (!matches || matches.length !== 4) return null;

  const mimeType = matches[1]!;
  const ext = matches[2]!;
  const base64 = matches[3]!;
  const buffer = Buffer.from(base64, "base64");

  return { base64, mimeType, ext, buffer };
}
