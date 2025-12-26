# 📚 HƯỚNG DẪN HOÀN CHỈNH - Smart Food Dynamic Pricing System Backend

> **Tài liệu tổng hợp**: Setup, API, Database Schema, và Testing Guide

---

## 📖 MỤC LỤC

1. [Quick Start](#-quick-start)
2. [Setup Chi Tiết](#-setup-chi-tiết)
3. [Database Schema](#-database-schema)
4. [API Documentation](#-api-documentation)
5. [Testing với Postman](#-testing-với-postman)
6. [Upload Ảnh](#-upload-ảnh-sản-phẩm)
7. [Project Status](#-project-status)
8. [Troubleshooting](#-troubleshooting)

---

# 🚀 QUICK START

## TL;DR - Chạy ngay trong 5 phút!

```bash
# 1. Tạo database SQL Server
sqlcmd -S localhost -U sa -Q "CREATE DATABASE smart_food_pricing"

# 2. Cấu hình .env
# Sửa DB_USER và DB_PASSWORD

# 3. Init database
npm run init-db

# 4. Run server
npm run dev

# 5. Test
# Browser: http://localhost:5000
# API: http://localhost:5000/api/categories
```

## Yêu cầu hệ thống
- ✅ Node.js v18+
- ✅ SQL Server 2019+ hoặc SQL Server Express
- ✅ npm (đi kèm Node.js)

---

# 🔧 SETUP CHI TIẾT

## Bước 1: Cài đặt SQL Server

### Option 1: SQL Server Express (Free - Khuyến nghị)

1. **Download SQL Server 2022 Express**
   - Link: https://www.microsoft.com/sql-server/sql-server-downloads
   - Chọn: **Express** (miễn phí)

2. **Cài đặt**
   - Chạy file installer
   - Chọn: **Basic** installation
   - Accept terms → Install (2-3 phút)

3. **Lấy connection string**
   ```
   Instance: SQLEXPRESS
   Connection: localhost\SQLEXPRESS
   ```

4. **Enable SQL Authentication**
   - Mở SQL Server Configuration Manager
   - Enable TCP/IP protocol
   - Restart SQL Server service

### Option 2: Tạo User/Password

**Tạo sa password:**
```sql
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = 'YourPassword123!';
```

**Hoặc tạo user mới:**
```sql
CREATE LOGIN app_user WITH PASSWORD = 'AppPassword123!';
CREATE USER app_user FOR LOGIN app_user;
ALTER SERVER ROLE sysadmin ADD MEMBER app_user;
```

## Bước 2: Cấu hình Backend

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Tạo file .env
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 3. Cấu hình .env
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# SQL Server Configuration
DB_SERVER=localhost\SQLEXPRESS
DB_PORT=1433
DB_DATABASE=smart_food_pricing
DB_USER=sa
DB_PASSWORD=YourPassword123!
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Secret
JWT_SECRET=your_random_secret_key_min_32_characters
JWT_EXPIRE=7d

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=Product
```

## Bước 3: Khởi tạo Database

### Tạo database
```sql
-- Dùng SSMS hoặc sqlcmd
CREATE DATABASE smart_food_pricing;
```

### Init tables và seed data
```bash
npm run init-db
```

**Kết quả mong đợi:**
```
✅ SQL Server connection established successfully.
📊 Creating database tables...
✅ Database synchronized successfully.
🌱 Seeding categories...
✅ Categories seeded successfully
✅ Database initialization completed successfully!
```

## Bước 4: Chạy Server

```bash
npm run dev
```

**Server đã chạy:**
```
============================================================
🚀 Server running at http://localhost:5000
📝 Environment: development
🗄️  Database: smart_food_pricing
☁️  Cloudinary: your_cloud_name
============================================================
```

---

# 📊 DATABASE SCHEMA

## Tables Overview

### 1. Categories Table
```sql
CREATE TABLE Categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
```

**Sample Data:**
- Rau củ 🥬
- Trái cây 🍎
- Thịt 🥩
- Hải sản 🐟
- Sữa và trứng 🥛

### 2. Products Table
```sql
CREATE TABLE Products (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    categoryId INT NOT NULL,
    
    -- Pricing
    basePrice DECIMAL(10, 2) NOT NULL,
    currentPrice DECIMAL(10, 2) NOT NULL,
    costPrice DECIMAL(10, 2) NOT NULL,
    
    -- Stock
    stock INT NOT NULL DEFAULT 0,
    initialStock INT NOT NULL DEFAULT 0,
    unit NVARCHAR(50) NOT NULL DEFAULT 'kg',
    
    -- Expiry
    expiryDate DATE NOT NULL,
    shelfLife INT NOT NULL,
    
    -- Pricing method
    pricingMethod NVARCHAR(20) NOT NULL DEFAULT 'fixed',
    
    -- Images (Cloudinary)
    image NVARCHAR(500),
    imagePublicId NVARCHAR(255),
    
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (categoryId) REFERENCES Categories(id) ON DELETE CASCADE
);
```

## Relationships
```
Categories (1) ---> (*) Products
```

## Models (Sequelize)

### Category Model
```javascript
{
  id: INTEGER,
  name: STRING(100) - UNIQUE,
  description: STRING(500),
  timestamps: true
}
```

### Product Model
```javascript
{
  id: INTEGER,
  name: STRING(255),
  description: TEXT,
  categoryId: INTEGER,
  basePrice: DECIMAL(10, 2),
  currentPrice: DECIMAL(10, 2),
  costPrice: DECIMAL(10, 2),
  stock: INTEGER,
  initialStock: INTEGER,
  unit: STRING(50),
  expiryDate: DATEONLY,
  shelfLife: INTEGER,
  pricingMethod: ENUM('fixed', 'dynamic', 'ai'),
  image: STRING(500),
  imagePublicId: STRING(255),
  isActive: BOOLEAN,
  timestamps: true
}
```

---

# 📡 API DOCUMENTATION

## Base URL
```
http://localhost:5000/api
```

## Categories API

### 1. GET All Categories
```
GET /api/categories
```
**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Rau củ",
      "description": "Rau xanh, củ quả tươi sống",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. GET Category by ID
```
GET /api/categories/:id
```
**Response:** Category với danh sách products

### 3. POST Create Category
```
POST /api/categories
Content-Type: application/json

{
  "name": "Rau Củ",
  "description": "Các loại rau củ tươi sạch"
}
```

### 4. PUT Update Category
```
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Rau Củ Organic",
  "description": "Rau củ hữu cơ"
}
```

### 5. DELETE Category
```
DELETE /api/categories/:id
```

## Products API

### 1. GET All Products
```
GET /api/products
```

**Query Parameters:**
- `categoryId` - Filter theo category
- `pricingMethod` - Filter theo method (fixed/dynamic/ai)
- `isActive` - Filter theo status (true/false)
- `search` - Tìm kiếm theo tên

**Examples:**
```
GET /api/products?categoryId=1
GET /api/products?isActive=true
GET /api/products?search=cà
GET /api/products?categoryId=1&isActive=true&search=cà
```

**Response (khi không có sản phẩm):**
```json
{
  "success": true,
  "count": 0,
  "message": "Không có sản phẩm nào. Vui lòng thêm sản phẩm mới.",
  "data": []
}
```

**Response (có sản phẩm):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Cà Chua Đà Lạt",
      "basePrice": "25000.00",
      "currentPrice": "25000.00",
      "stock": 100,
      "image": "https://res.cloudinary.com/...",
      "category": {
        "id": 1,
        "name": "Rau Củ"
      }
    }
  ]
}
```

### 2. GET Product by ID
```
GET /api/products/:id
```

**Response (không tìm thấy):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 3. POST Create Product
```
POST /api/products
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: Cà Chua Đà Lạt
description: Cà chua tươi từ Đà Lạt
categoryId: 1
basePrice: 25000
currentPrice: 25000
costPrice: 18000
stock: 100
initialStock: 100
unit: kg
expiryDate: 2025-02-01
shelfLife: 7
pricingMethod: fixed
isActive: true
image: [File - Optional]
```

**Required Fields:**
- name
- categoryId
- basePrice
- costPrice
- expiryDate
- shelfLife

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Cà Chua Đà Lạt",
    "image": "https://res.cloudinary.com/your_cloud_name/image/upload/.../Product/xxx.jpg",
    "imagePublicId": "Product/xxx",
    ...
  }
}
```

### 4. PUT Update Product
```
PUT /api/products/:id
Content-Type: multipart/form-data
```

**Body:** Chỉ cần các field muốn update
```
name: Cà Chua Đà Lạt Premium
currentPrice: 28000
image: [File mới - Optional]
```

**Lưu ý:** Nếu upload ảnh mới, ảnh cũ sẽ tự động xóa trên Cloudinary

### 5. DELETE Product
```
DELETE /api/products/:id
```
Tự động xóa ảnh trên Cloudinary

### 6. PATCH Update Price
```
PATCH /api/products/:id/price
Content-Type: application/json

{
  "currentPrice": 22000,
  "pricingMethod": "dynamic"
}
```

---

# 🧪 TESTING VỚI POSTMAN

## Setup Postman

### 1. Tạo Collection
- Mở Postman
- New → Collection
- Tên: "Website Vegetable API"

### 2. Tạo Environment (Optional)
```
baseUrl: http://localhost:5000
```

## Test Workflow

### BƯỚC 1: Tạo Categories

**Request 1 - Rau Củ:**
```
POST {{baseUrl}}/api/categories
Content-Type: application/json

{
  "name": "Rau Củ",
  "description": "Các loại rau củ tươi sạch"
}
```

**Request 2 - Trái Cây:**
```json
{
  "name": "Trái Cây",
  "description": "Các loại trái cây tươi ngon"
}
```

**Request 3 - Gia Vị:**
```json
{
  "name": "Gia Vị",
  "description": "Các loại gia vị nấu ăn"
}
```

### BƯỚC 2: Kiểm tra Categories
```
GET {{baseUrl}}/api/categories
```

### BƯỚC 3: Tạo Products (KHÔNG CÓ ẢNH)

```
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "name": "Cà Chua Đà Lạt",
  "description": "Cà chua tươi từ Đà Lạt, ngọt và mọng nước",
  "categoryId": 1,
  "basePrice": 25000,
  "currentPrice": 25000,
  "costPrice": 18000,
  "stock": 100,
  "initialStock": 100,
  "unit": "kg",
  "expiryDate": "2025-02-01",
  "shelfLife": 7,
  "pricingMethod": "fixed",
  "isActive": true
}
```

### BƯỚC 4: Kiểm tra Products
```
GET {{baseUrl}}/api/products
```

### BƯỚC 5: Filter & Search
```
GET {{baseUrl}}/api/products?categoryId=1
GET {{baseUrl}}/api/products?search=cà
GET {{baseUrl}}/api/products?isActive=true
```

### BƯỚC 6: Update Product
```
PUT {{baseUrl}}/api/products/1
Content-Type: application/json

{
  "currentPrice": 22000,
  "stock": 90
}
```

### BƯỚC 7: Update Price
```
PATCH {{baseUrl}}/api/products/1/price
Content-Type: application/json

{
  "currentPrice": 20000,
  "pricingMethod": "dynamic"
}
```

### BƯỚC 8: Delete Product
```
DELETE {{baseUrl}}/api/products/1
```

---

# 📸 UPLOAD ẢNH SẢN PHẨM

## Có! Bạn có thể upload ảnh khi tạo/cập nhật sản phẩm

### Thông tin kỹ thuật:
- ✅ **Cloudinary Storage** - Lưu trên cloud
- ✅ **Auto Resize** - 800x800px
- ✅ **Định dạng** - JPG, JPEG, PNG, WEBP
- ✅ **Giới hạn** - 5MB
- ✅ **Optional** - Không bắt buộc

## Cách upload trên Postman

### BƯỚC 1: Setup Request
```
POST http://localhost:5000/api/products
```

### BƯỚC 2: Chọn Body
- Click tab **Body**
- Chọn **form-data** (KHÔNG chọn raw!)

### BƯỚC 3: Thêm các field

| KEY | VALUE | TYPE |
|-----|-------|------|
| name | Cà Chua Bi | **Text** |
| description | Cà chua bi tươi ngon | **Text** |
| categoryId | 1 | **Text** |
| basePrice | 35000 | **Text** |
| currentPrice | 35000 | **Text** |
| costPrice | 25000 | **Text** |
| stock | 60 | **Text** |
| initialStock | 60 | **Text** |
| unit | kg | **Text** |
| expiryDate | 2025-02-10 | **Text** |
| shelfLife | 5 | **Text** |
| pricingMethod | fixed | **Text** |
| isActive | true | **Text** |
| **image** | [Select File] | **File** ⬅️ |

### BƯỚC 4: Upload ảnh
1. Ở dòng **image**
2. Click dropdown **TYPE** → Chọn **File**
3. Click **"Select Files"**
4. Chọn ảnh từ máy tính (< 5MB)

### BƯỚC 5: Send Request

**Response thành công:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Cà Chua Bi",
    "image": "https://res.cloudinary.com/your_cloud_name/image/upload/v.../Product/abc123.jpg",
    "imagePublicId": "Product/abc123",
    ...
  }
}
```

## Update ảnh sản phẩm

```
PUT http://localhost:5000/api/products/1
Body: form-data

name: Cà Chua Bi Premium
image: [Chọn ảnh mới] (File)
```

**Lưu ý:** Ảnh cũ sẽ TỰ ĐỘNG bị xóa trên Cloudinary!

## Xem ảnh đã upload

1. **Copy link từ response:**
   ```
   image: "https://res.cloudinary.com/your_cloud_name/..."
   ```

2. **Mở link trên browser** để xem ảnh

3. **Hoặc check Cloudinary Dashboard:**
   - Login: https://cloudinary.com/console
   - Media Library → Folder "Product"

## Các lỗi thường gặp

### ❌ "Only image files are allowed!"
- **Nguyên nhân:** File không phải ảnh
- **Giải pháp:** Chỉ upload JPG, PNG, WEBP

### ❌ "File too large"
- **Nguyên nhân:** Ảnh > 5MB
- **Giải pháp:** Nén ảnh tại https://tinypng.com/

### ❌ Không thấy ô upload file
- **Nguyên nhân:** TYPE vẫn là "Text"
- **Giải pháp:** Chuyển TYPE thành "File"

---

# ✅ PROJECT STATUS

## Hoàn thành

### Backend Core ✅
- [x] Express server setup
- [x] SQL Server + Sequelize ORM
- [x] Database connection pooling
- [x] CORS configuration
- [x] Environment variables

### Models ✅
- [x] Category model
- [x] Product model
- [x] Model associations

### Controllers ✅
- [x] Category CRUD
- [x] Product CRUD
- [x] Image upload/delete
- [x] Filters & search
- [x] Error handling

### Cloudinary Integration ✅
- [x] Upload middleware
- [x] Auto resize (800x800px)
- [x] Delete old images
- [x] Folder organization

### Documentation ✅
- [x] Setup guide
- [x] API documentation
- [x] Testing guide
- [x] Troubleshooting

## Cấu trúc Project

```
backend/
├── config/
│   ├── cloudinary.js          ✅
│   └── database.js             ✅
├── models/
│   ├── Category.js             ✅
│   ├── Product.js              ✅
│   └── index.js                ✅
├── controllers/
│   ├── categoryController.js   ✅
│   └── productController.js    ✅
├── routes/
│   ├── categoryRoutes.js       ✅
│   └── productRoutes.js        ✅
├── middleware/
│   └── uploadMiddleware.js     ✅
├── utils/
│   └── seedCategories.js       ✅
├── scripts/
│   └── initDatabase.js         ✅
├── index.js                    ✅
├── package.json                ✅
└── .env                        ✅
```

## API Endpoints Ready

```
✅ GET    /api/categories
✅ GET    /api/categories/:id
✅ POST   /api/categories
✅ PUT    /api/categories/:id
✅ DELETE /api/categories/:id

✅ GET    /api/products
✅ GET    /api/products/:id
✅ POST   /api/products (multipart)
✅ PUT    /api/products/:id (multipart)
✅ DELETE /api/products/:id
✅ PATCH  /api/products/:id/price
```

---

# 🐛 TROUBLESHOOTING

## Lỗi kết nối SQL Server

### ❌ Cannot connect to SQL Server

**Kiểm tra:**
1. SQL Server đang chạy:
   ```bash
   Get-Service -Name "*SQL*"
   ```

2. Enable TCP/IP:
   - SQL Server Configuration Manager
   - SQL Server Network Configuration
   - Protocols for SQLEXPRESS → TCP/IP → Enable
   - Restart service

3. Check firewall:
   ```bash
   New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
   ```

### ❌ Login failed for user 'sa'

**Giải pháp:**
```sql
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = 'NewPassword123!';
```

Hoặc tạo user mới:
```sql
CREATE LOGIN app_user WITH PASSWORD = 'AppPassword123!';
CREATE USER app_user FOR LOGIN app_user;
ALTER SERVER ROLE sysadmin ADD MEMBER app_user;
```

### ❌ Database does not exist

```sql
CREATE DATABASE smart_food_pricing;
```

## Lỗi Cloudinary

### ❌ Cloudinary upload failed

**Kiểm tra:**
1. File .env có đầy đủ config:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. File size < 5MB

3. File format: jpg, jpeg, png, webp

## Lỗi API

### ❌ Required fields missing

**Khi tạo product, cần đầy đủ:**
- name
- categoryId
- basePrice
- costPrice
- expiryDate
- shelfLife

### ❌ Category not found

Tạo category trước khi tạo product:
```
POST /api/categories
```

### ❌ Port 5000 already in use

**Đổi port trong .env:**
```env
PORT=5001
```

Hoặc kill process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

---

## 📞 Commands Cheat Sheet

```bash
# Development
npm run dev              # Start server (watch mode)
npm start                # Start server (production)

# Database
npm run init-db          # Initialize database + seed

# Testing
curl http://localhost:5000
curl http://localhost:5000/api/categories
```

---

## 🎯 Next Steps

1. ✅ Backend Core - HOÀN THÀNH
2. ⏳ Frontend Development
3. ⏳ User Authentication (JWT)
4. ⏳ Order Management
5. ⏳ Pricing Algorithms (Fixed/Dynamic/AI)
6. ⏳ Simulation Engine
7. ⏳ Analytics Dashboard

---

**Last Updated:** 2025-12-26  
**Status:** 🟢 PRODUCTION READY  
**Version:** 1.0.0
