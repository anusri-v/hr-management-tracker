const crypto = require('crypto');
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// ---------------------------------------------------------------------------
// Object storage abstraction.
//
// This is the ONLY module that knows about the underlying storage provider.
// It currently targets a Railway Bucket (S3-compatible). To move to AWS S3,
// GCS, R2, etc. later, change the client config / commands here and nothing
// else in the codebase needs to change.
// ---------------------------------------------------------------------------

// Accept either our S3_* names (local .env) or the Railway Bucket's native
// variable names (ENDPOINT / BUCKET / ACCESS_KEY_ID / SECRET_ACCESS_KEY / REGION),
// which Railway injects when a bucket is linked to the service.
const BUCKET = process.env.S3_BUCKET || process.env.BUCKET;

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT || process.env.ENDPOINT,
    region: process.env.S3_REGION || process.env.REGION || 'auto',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY,
    },
});

// Turn an arbitrary filename into something safe for an object key.
function sanitizeFileName(fileName) {
    return String(fileName || 'file')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(-100);
}

// Deterministic-ish, collision-resistant object key for an employee document.
function buildKey({ employeeId, documentType, fileName }) {
    const unique = crypto.randomUUID();
    return `employees/${employeeId}/${documentType}/${unique}-${sanitizeFileName(fileName)}`;
}

// Presigned PUT URL — the browser uploads the file bytes directly to the bucket.
// The signed Content-Type must match the header the browser sends on PUT.
async function getUploadUrl({ key, contentType, expiresIn = 300 }) {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
    });
    return getSignedUrl(s3, command, { expiresIn });
}

// Presigned GET URL — short-lived link used to view/download a private object.
async function getDownloadUrl({ key, expiresIn = 300 }) {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, command, { expiresIn });
}

async function deleteObject(key) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

module.exports = { buildKey, getUploadUrl, getDownloadUrl, deleteObject };
