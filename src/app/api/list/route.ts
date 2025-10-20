import { NextRequest, NextResponse } from "next/server";
import { S3Client, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { OUTPUT_BUCKET, INPUT_BUCKET } from "../config";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function GET(req: NextRequest) {
  try {
    const origKey = req.nextUrl.searchParams.get("key");
    if (!origKey) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const base = origKey.split(".")[0]; // remove extension
    const sizes = ["1080p", "720p", "480p"];
    const formats = ["webp", "jpg"];

    // Result structure: { "original": string | null, "1080p": { format: string; url: string }[], ... }
    const urls: Record<string, string | null | { format: string; url: string }[]> = {};

    // Check for original image in input bucket
    try {
      await s3.send(new HeadObjectCommand({ Bucket: INPUT_BUCKET, Key: origKey }));
      const originalUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: INPUT_BUCKET, Key: origKey }),
        { expiresIn: 3600 } // 1 hour
      );
      urls["original"] = originalUrl;
      console.log(`✅ Found original: ${origKey}`);
    } catch (err) {
      console.log(`⚠️ Original not found: ${origKey}`, err);
      urls["original"] = null;
    }

    for (const size of sizes) {
      urls[size] = [];
      for (const ext of formats) {
        const key = `${size}/${base}.${ext}`;
        try {
          await s3.send(new HeadObjectCommand({ Bucket: OUTPUT_BUCKET, Key: key }));

          const url = await getSignedUrl(
            s3,
            new GetObjectCommand({ Bucket: OUTPUT_BUCKET, Key: key }),
            { expiresIn: 3600 } // 1 hour
          );

          urls[size].push({ format: ext, url });
          console.log(`✅ Found key: ${key}`);
        } catch (err) {
          console.log(`⚠️ Key not found: ${key}`, err);
        }
      }
    }

    return NextResponse.json(urls);
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json({ error: "Failed to list processed images" }, { status: 500 });
  }
}
