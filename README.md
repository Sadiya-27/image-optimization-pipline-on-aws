# 🖼️ Image Optimization Pipeline on AWS

This repository implements a **serverless image optimization pipeline** powered by **AWS services**, with a **Next.js frontend** for uploading and viewing optimized images.  
The system automatically processes and optimizes images using AWS Lambda and S3, and the frontend is **deployed on AWS EC2** for public access.

---

### 🧩 Components and Flow

1. **Client Application (Next.js)**  
   - The web application allows users to upload raw images.  
   - Uploaded images are sent directly to the designated S3 bucket.

2. **Amazon S3 (Original Bucket)**  
   - Stores the original, high-resolution images.  
   - Triggers an event upon new image uploads.

3. **S3 Event Notification**  
   - Automatically triggers an AWS Lambda function when a new image is added.

4. **AWS Lambda (Python)**  
   - Downloads the uploaded image using S3 event metadata.  
   - Optimizes images by resizing, compressing, and converting formats (e.g., JPEG/PNG → WebP).  
   - Uploads the optimized versions to another S3 bucket.

5. **Amazon S3 (Optimized Bucket)**  
   - Stores all optimized and resized images for retrieval by the client application.

6. **Client Retrieval**  
   - The Next.js app fetches optimized images directly from the optimized S3 bucket and displays them to the user.

---

## Architecture of the system
<img width="1000" height="525" alt="image" src="https://github.com/user-attachments/assets/2d49bb62-745b-4956-8932-5e83a4366fca" />

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (TypeScript, Tailwind CSS)
- **Backend:** AWS Lambda (Python)
- **Storage:** Amazon S3
- **Deployment:** AWS EC2
- **Language:** TypeScript & Python
- **Infrastructure:** Serverless (S3 + Lambda)

---
## Demo Video

[https://github.com/user-attachments/assets/18028dc4-c4bf-45ee-8606-1919b8267fa4
](https://www.youtube.com/watch?v=ai_Q5XNPoD4)
---

## ⚙️ Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Sadiya-27/image-optimization-pipline-on-aws.git
cd image-optimization-pipline-on-aws
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Run Locally
```bash
npm run dev
```

Then open your browser at 👉 http://localhost:3000

### 4️⃣ Environment Variables

Create a .env.local file in the project root with the following keys:
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
S3_BUCKET_ORIGINAL=your-original-bucket-name
S3_BUCKET_OPTIMIZED=your-optimized-bucket-name
```
## 📦 AWS Setup Summary

1. Create Two S3 Buckets

2. original-bucket → receives raw uploads

3. optimized-bucket → stores processed images

4. Attach S3 Trigger

5. Configure an S3 event notification on original-bucket to invoke the Lambda function on object creation.

6. Deploy AWS Lambda

7. Write the Lambda function in Python using boto3 and Pillow for image manipulation.

8. Grant necessary IAM permissions for S3 read/write access.

9. Deploy Next.js App on EC2

10. Run the frontend on an EC2 instance to provide public access to the upload interface and optimized images.

## 🌐 Deployment on AWS EC2

### The Next.js app is deployed on an AWS EC2 instance, serving as the public-facing interface for uploading and retrieving optimized images.

### Steps:

1. Launch an EC2 instance (Ubuntu preferred).

2. SSH into the instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

3. Install Node.js, Git, and NPM.

4. Clone this repository and run:
```bash
npm install
npm run build
npm start
```

5. Use PM2 or systemd to keep the app running persistently.

6. Access your site via your EC2 public DNS or domain.

## 📊 Benefits

- ✅ Automated Optimization — No manual resizing or compression needed.
- ✅ Cost-Efficient — Uses pay-as-you-go AWS Lambda and S3.
- ✅ Scalable — Handles large image uploads automatically.
- ✅ Low Maintenance — Fully serverless backend, no manual scaling.
- ✅ Fast Delivery — Optimized images load faster and save bandwidth.

## 🧠 Future Improvements

- ✅ Add support for additional image formats (e.g., AVIF).

- ✅ Implement user authentication for image uploads.

- ✅ Introduce progress bars and real-time optimization status.

- ✅ Add automated deletion of unused images after a set duration.
