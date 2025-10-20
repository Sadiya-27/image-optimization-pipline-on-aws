import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { INPUT_BUCKET } from "../config";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    const presigned = await createPresignedPost(s3, {
      Bucket: INPUT_BUCKET,
      Key: filename,
      Fields: {
        "Content-Type": contentType
      },
      Conditions: [
        ["content-length-range", 1, 10_000_000]
      ],
      Expires: 900, // in seconds
    });

    return NextResponse.json(presigned);
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Failed to create presigned URL" }, { status: 500 });
  }
}
