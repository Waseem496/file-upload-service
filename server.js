const express = require('express');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getType } = require('mime');
const path = require('path');
const crypto = require('crypto');
const { Readable } = require('stream');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(helmet());
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } })); // 5MB limit

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const fileTypes = ['image/jpeg', 'image/png', 'application/pdf'];

//upload file to S3 bucket
app.post('/upload', async (req, res) => {
  console.log('Received file upload request');
  try {
    console.log('Request files:', req.files);
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;

    if (!fileTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const extension = path.extname(file.name);
    const fileKey = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.data,
      ContentType: file.mimetype
    };

    await s3.send(new PutObjectCommand(uploadParams));

    res.json({ message: 'File uploaded successfully', key: fileKey });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

//Get File from S3 bucket
app.get('/files/:key', async (req, res) => {
  try {
    const fileKey = path.basename(req.params.key);
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey
    });

    const file = await s3.send(getCommand);
    const stream = file.Body instanceof Readable ? file.Body : Readable.from(file.Body);

    res.setHeader('Content-Disposition', `attachment; filename="${fileKey}"`);
    res.setHeader('Content-Type', file.ContentType || 'application/octet-stream');

    stream.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
