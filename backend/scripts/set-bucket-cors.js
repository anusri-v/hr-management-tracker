// One-off: apply a CORS policy to the Railway bucket so the browser can PUT
// files directly via presigned URLs. Run: node scripts/set-bucket-cors.js
require('dotenv').config();
const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'auto',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://hr-management-tracker-frontend-production.up.railway.app',
];

async function main() {
    const Bucket = process.env.S3_BUCKET;
    await s3.send(new PutBucketCorsCommand({
        Bucket,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedOrigins: ALLOWED_ORIGINS,
                    AllowedMethods: ['GET', 'PUT', 'HEAD'],
                    AllowedHeaders: ['*'],
                    ExposeHeaders: ['ETag'],
                    MaxAgeSeconds: 3000,
                },
            ],
        },
    }));
    console.log(`Applied CORS to bucket "${Bucket}".`);

    const current = await s3.send(new GetBucketCorsCommand({ Bucket }));
    console.log('Current CORS rules:', JSON.stringify(current.CORSRules, null, 2));
}

main().catch((e) => {
    console.error('Failed to set CORS:', e.name, e.message);
    process.exit(1);
});
