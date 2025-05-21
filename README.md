# file-upload-service

# 📁 File Upload Service

A simple and secure file upload service built with Node.js and Express. It supports uploading images and PDF files, with optional AWS S3 storage integration.

---

## 🚀 Features

- Upload files via `POST /upload`
- Download files via `GET /files/:filename`
- File size validation (max 5MB)
- File type validation (images & PDFs only)
- Secure storage (local or AWS S3)
- Basic protection against path traversal attacks

---

## 📦 Tech Stack

- Node.js
- Express
- express-fileupload
- AWS SDK v3
- MIME package

---

## 🛠 Installation

1. Clone the repository:

```bash
git clone https://github.com/Waseem496/file-upload-service.git
cd file-upload-service
