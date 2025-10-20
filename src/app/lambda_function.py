import boto3
from io import BytesIO
from PIL import Image
import os
import logging
from urllib.parse import unquote_plus

s3 = boto3.client('s3')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

TARGETS = {
    "1080p": (1920, 1080),
    "720p": (1280, 720),
    "480p": (854, 480)
}

OUTPUT_BUCKET = os.environ.get('OUTPUT_BUCKET')


def resize_and_compress(image_bytes, size):
    """Resize the image to the target size (upscaling or downscaling)."""
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = img.resize(size, Image.Resampling.LANCZOS)  # resize exactly to target
    return img


def save_to_s3(img, key_base, fmt, content_type):
    """Save the given image to S3 in the specified format."""
    out_io = BytesIO()
    if fmt == "JPEG":
        img.save(out_io, format=fmt, quality=85, optimize=True)
    elif fmt == "WEBP":
        img.save(out_io, format=fmt, quality=85, method=6)
    else:
        raise ValueError("Unsupported format")

    out_io.seek(0)
    s3.put_object(
        Bucket=OUTPUT_BUCKET,
        Key=key_base,
        Body=out_io.read(),
        ContentType=content_type
    )
    logger.info(f"✅ Uploaded {key_base} ({fmt}) to {OUTPUT_BUCKET}")


def lambda_handler(event, context):
    logger.info("Event received: %s", event)
    record = event['Records'][0]
    input_bucket = record['s3']['bucket']['name']
    key = unquote_plus(record['s3']['object']['key'])

    obj = s3.get_object(Bucket=input_bucket, Key=key)
    original = obj['Body'].read()

    base_name = os.path.basename(key)
    name_no_ext = os.path.splitext(base_name)[0]

    if not OUTPUT_BUCKET:
        logger.error("❌ OUTPUT_BUCKET environment variable not set")
        return {"statusCode": 500, "body": "Missing OUTPUT_BUCKET"}

    for label, size in TARGETS.items():
        img = resize_and_compress(original, size)

        # Save as .jpg
        jpg_key = f"{label}/{name_no_ext}.jpg"
        save_to_s3(img, jpg_key, "JPEG", "image/jpeg")

        # Save as .webp
        webp_key = f"{label}/{name_no_ext}.webp"
        save_to_s3(img, webp_key, "WEBP", "image/webp")

    logger.info("✅ Successfully processed all target sizes and formats.")
    return {"statusCode": 200, "body": "Success"}
