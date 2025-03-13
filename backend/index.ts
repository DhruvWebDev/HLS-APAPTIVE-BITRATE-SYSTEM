import { S3Client, serve } from "bun";
import dotenv from "dotenv";
dotenv.config();
// AWS S3
const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET,
  endpoint: process.env.S3_BUCKET_ENDPOINT,
  region: process.env.AWS_REGION,
});



// ✅ Upload a File to S3
async function uploadToS3(file: File): Promise<string> {
  const buffer = await file.arrayBuffer(); // Convert File to ArrayBuffer
  const fileName = `videos/${Date.now()}-${file.name}`;

  const result = await s3.write(fileName, buffer);

  return result.url; // Return the S3 file URL
}

// ✅ Handle File Uploads
async function handleUpload(formData: FormData): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const [_, file] of formData.entries()) {
    if (file instanceof File) {
      const url = await uploadToS3(file);
      uploadedUrls.push(url);
    }
  }

  return uploadedUrls;
}

// ✅ Start Bun Server
const server = serve({
  async fetch(req) {
    const path = new URL(req.url).pathname;

    // Handle CORS Preflight (OPTIONS request)
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (path === "/upload" && req.method === "POST") {
      try {
        const formData = await req.formData();
        console.log("Received form data:", formData);

        // Upload files
        const uploadedUrls = await handleUpload(formData);

        return new Response(JSON.stringify({ message: "Upload successful", urls: uploadedUrls }), {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Error uploading files:", error);
        return new Response(JSON.stringify({ error: "Upload failed" }), {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running on:", server.url);
