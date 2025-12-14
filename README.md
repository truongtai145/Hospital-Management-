🏥 Hospital Management System

Laravel (Backend) + ReactJS (Frontend)

📌 Giới thiệu

Hospital Management System là một hệ thống quản lý bệnh viện giúp số hóa các quy trình như quản lý bệnh nhân, bác sĩ, lịch hẹn, hồ sơ y tế và thanh toán.
Dự án được xây dựng theo mô hình Frontend – Backend tách biệt, sử dụng Laravel để cung cấp API và ReactJS để xây dựng giao diện người dùng hiện đại.

⚙️ Công nghệ sử dụng
🔹 Backend

PHP 8+

Laravel 10+

MySQL

Laravel Sanctum / JWT (Authentication)

RESTful API

🔹 Frontend

ReactJS

React Router

Axios

Tailwind CSS / CSS

Lucide / FontAwesome Icons

✨ Chức năng chính
👤 Người dùng

Đăng ký / Đăng nhập

Quản lý thông tin cá nhân

Đặt lịch khám bệnh

Xem lịch sử khám và hóa đơn

🩺 Bác sĩ

Quản lý lịch làm việc

Xem danh sách bệnh nhân

Cập nhật hồ sơ khám bệnh

🗓️ Lịch hẹn

Tạo, cập nhật, hủy lịch hẹn

Phân trang và tìm kiếm

Trạng thái lịch hẹn (Pending, Confirmed, Completed, Cancelled)

💳 Thanh toán

Tạo hóa đơn khám bệnh

Thanh toán trực tuyến (VNPAY – sandbox)

Xem chi tiết hóa đơn

🛠️ Quản trị viên

Quản lý người dùng & phân quyền

Quản lý bác sĩ, khoa, dịch vụ

Thống kê & báo cáo

🗂️ Cấu trúc thư mục
hospital-management/
│
├── backend/              # Laravel Backend
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── .env
│
├── frontend/             # ReactJS Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.jsx
│   └── package.json
│
└── README.md

🚀 Cài đặt & Chạy dự án
🔧 Backend (Laravel)
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve


API mặc định chạy tại:

http://localhost:8000

🎨 Frontend (ReactJS)
cd frontend
npm install
npm run dev


Ứng dụng chạy tại:
 
http://localhost:5173 
