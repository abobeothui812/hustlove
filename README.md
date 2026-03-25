# HUSTLOVE

HUSTLOVE là một ứng dụng web social/dating dành cho sinh viên, gồm frontend React và backend Node.js + Express.
Dự án hỗ trợ các tính năng chính như:

- Đăng ký, đăng nhập, xác thực người dùng
- Hoàn thiện hồ sơ cá nhân, quản lý ảnh
- Gợi ý kết nối và ghép cặp
- Nhắn tin thời gian thực bằng Socket.IO
- Thông báo real-time
- Khu vực cộng đồng và thư viện lời mời

## 1) Kiến trúc tổng quan

- Frontend: thư mục my-react-app
  - React + Vite + Tailwind CSS
  - Router và các trang giao diện người dùng
- Backend: thư mục Server
  - Node.js + Express + MongoDB (Mongoose)
  - API, xác thực, xử lý nghiệp vụ, Socket.IO
- CI/CD: thư mục .github/workflows
  - Pipeline build Docker image và deploy backend lên EC2

## 2) Công nghệ sử dụng

- Frontend: React 19, Vite, Tailwind CSS, Axios, Socket.IO client
- Backend: Express 5, Mongoose, JWT, CORS, Helmet, Rate Limit, Socket.IO
- CSDL: MongoDB (Atlas)
- Triển khai: Docker, AWS EC2, Vercel

## 3) Chạy dự án ở local

### 3.1 Yêu cầu môi trường

- Node.js 18 trở lên
- npm 9 trở lên
- MongoDB URI hợp lệ (local hoặc Atlas)

### 3.2 Cấu hình biến môi trường

Tạo file Server/.env với ví dụ tối thiểu:

	PORT=5000
	MONGO_URI=your_mongodb_connection_string
	FRONTEND_URL=http://localhost:5173
	JWT_SECRET=your_jwt_secret
	JWT_ACCESS_EXPIRATION=15m
	JWT_REFRESH_EXPIRATION=30d
	JWT_REFRESH_EXPIRATION_MS=2592000000
	CLOUDINARY_CLOUD_NAME=your_cloud_name
	CLOUDINARY_API_KEY=your_cloudinary_key
	CLOUDINARY_API_SECRET=your_cloudinary_secret

Tạo file my-react-app/.env với ví dụ:

	VITE_API_URL=http://localhost:5000

Lưu ý bảo mật:

- Không commit file .env lên Git
- Không để lộ JWT secret, Cloudinary secret, database credentials

### 3.3 Cài dependencies

Terminal 1 (backend):

	cd Server
	npm install

Terminal 2 (frontend):

	cd my-react-app
	npm install

### 3.4 Chạy development

Terminal 1 (backend):

	cd Server
	npm run dev

Terminal 2 (frontend):

	cd my-react-app
	npm run dev

Sau khi chạy:

- Frontend mặc định: http://localhost:5173
- Backend mặc định: http://localhost:5000

Health check backend:

	GET http://localhost:5000/api/health

### 3.5 Build production local

Frontend:

	cd my-react-app
	npm run build
	npm run preview

Backend:

	cd Server
	npm start

## 4) CI/CD

### 4.1 GitHub Actions (Backend Docker Deploy to EC2)

File pipeline:

- .github/workflows/main.yml

Trigger:

- Tự động chạy khi có push lên nhánh main

Luồng pipeline:

1. Checkout source code
2. Tạo image tag từ commit SHA
3. Build Docker image cho backend trong thư mục Server
4. Save image thành file nén image.tar.gz
5. SSH vào EC2 bằng key từ GitHub Secrets
6. Copy image sang EC2
7. Stop container cũ (nếu có), load image mới và chạy lại container
8. Dọn image cũ để tiết kiệm dung lượng

GitHub Secrets cần cấu hình:

- EC2_SSH_KEY
- EC2_HOST

Trên EC2 cần có sẵn:

- Docker
- File /home/ubuntu/.env chứa biến môi trường backend
- Quyền chạy container cho user deploy

### 4.2 Vercel (Frontend và Backend)

Frontend:

- Thư mục my-react-app có cấu hình vercel.json để rewrite tất cả route về index.html
- Phù hợp cho SPA sử dụng React Router

Backend:

- Thư mục Server có vercel.json cấu hình @vercel/node cho server.js
- Route /api/* và /socket.io/* được chuyển vào server.js

Gợi ý vận hành:

- Chọn 1 chiến lược backend chính (EC2 Docker hoặc Vercel) để tránh chồng chéo
- Nếu dùng Vercel cho backend, cần kiểm tra kỹ giới hạn serverless cho websocket/long-lived connection

## 5) Scripts nhanh

Frontend (my-react-app):

- npm run dev: chạy dev server Vite
- npm run build: build production
- npm run preview: chạy bản build
- npm run lint: kiểm tra lint

Backend (Server):

- npm run dev: chạy với nodemon
- npm start: chạy production bằng node server.js

## 6) Gợi ý cải thiện tiếp theo

- Bổ sung file env mẫu như Server/.env.example và my-react-app/.env.example
- Thêm bước test/lint vào pipeline CI trước khi deploy
- Tách rõ môi trường staging và production