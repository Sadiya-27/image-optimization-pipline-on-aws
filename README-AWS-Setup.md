# AWS Setup Instructions for Image Optimizer

## Prerequisites
- AWS Account
- AWS CLI installed (optional, for easier setup)

## Step 1: Create S3 Buckets

1. Go to AWS S3 Console
2. Create two buckets:
   - Input bucket: `your-input-bucket-name` (replace with your preferred name)
   - Output bucket: `your-output-bucket-name` (replace with your preferred name)

## Step 2: Configure Bucket Permissions

### For Output Bucket (Public Access for Images):
1. Go to your output bucket
2. Permissions tab > Bucket Policy
3. Add the policy from `bucket-policy.json` (replace YOUR_OUTPUT_BUCKET_NAME)

### For Input Bucket:
1. Keep default private settings (presigned URLs will handle access)

## Step 3: Create IAM User

1. Go to AWS IAM Console
2. Create a new user (e.g., `image-optimizer-user`)
3. Attach the policy from `s3-policy.json` (replace bucket names)
4. Note down the Access Key ID and Secret Access Key

## Step 4: Update Environment Variables

Update your `.env.local` file with:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_INPUT_BUCKET=your-input-bucket-name
S3_OUTPUT_BUCKET=your-output-bucket-name
```

## Step 5: CORS Configuration

**Important**: You must configure CORS on your input bucket (`demo-demo-s3-input`) to allow uploads from your local development server:

1. Go to AWS S3 Console > your input bucket (`demo-demo-s3-input`)
2. Permissions tab > CORS
3. Replace any existing configuration with the content from `cors-policy.json`

This allows your browser to make direct POST requests to S3 for file uploads.

## Step 6: Lambda Function Setup

You'll need to set up a Lambda function to process the images. This typically involves:
- Creating a Lambda function with Python runtime
- Adding the Pillow layer (already included in this project)
- Configuring S3 triggers
- Setting up the image resizing logic

## Troubleshooting

- **"Failed to fetch" error**: Check AWS credentials and bucket names
- **Access Denied**: Verify IAM permissions
- **Bucket not found**: Ensure bucket names are correct and in the right region
- **CORS errors**: Configure CORS policy on input bucket

## Security Notes

- Never commit `.env.local` to version control
- Use IAM roles instead of access keys in production
- Regularly rotate access keys
- Limit bucket policies to specific origins in production
