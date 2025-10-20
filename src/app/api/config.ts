// config.ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  // Only use credentials in local dev
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export const INPUT_BUCKET = process.env.S3_INPUT_BUCKET!;
export const OUTPUT_BUCKET = process.env.S3_OUTPUT_BUCKET!;
