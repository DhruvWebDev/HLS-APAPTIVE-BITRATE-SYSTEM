

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


