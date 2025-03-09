import { S3Client, serve } from "bun";
import dotenv from "dotenv";

// AWS S3
const s3 = new S3Client({
  accessKeyId: "AKIA6JKEXX26ORJAAJ7X",
  secretAccessKey: "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",
  bucket: "deploifybuildfile",
   endpoint: "https://s3.eu-north-1.amazonaws.com",
  // region: "us-east-1",
});


async function handleUpload(req) {
  upload.array("videos", 100)(req, {}, (err) => {
    if (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ message: "Files uploaded successfully!" }), { status: 200 });
  });
}


// Multer storage configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "deploifybuildfile",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `videos/${Date.now()}-${file.originalname}`); // Store in 'videos/' folder
    },
  }),
});


const server = serve({
	async fetch(req){
		const path = new URL(req.url).pathname;

		if(path == "/upload"){
			 return handleUpload(req);
		}else if(path == "/"){
			return new Response("Hello from server")
		}
	}
})

console.log(server.url)
