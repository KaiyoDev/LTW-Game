# Quạ Đen, Sáu Vụ Án Sài Gòn 1998

Game point and click giải đố, phong cách Rusty Lake, làm bằng HTML, CSS, JavaScript thuần, back-end PHP, cơ sở dữ liệu MySQL.

## Tổng quan

- Môn học: Lập trình website (LTWEB)
- GVHD: ThS. Trần Thịnh Mạnh Đức
- Nhóm: Nhóm 5, 6 thành viên
- Đề tài: game point and click giải đố, 1 vụ án duy nhất, 6 chương, 20 phòng, 46 câu đố
- Người chơi vào vai Đặng Minh An, 22 tuổi, sinh viên báo chí, cháu ruột chú Bảo
- Nhiệm vụ: tìm đủ 6 trang sổ trong 1 ngày 1 đêm, từ sáng 10/03 tới 09:00 sáng 11/03/1998, trước giờ kiểm tra sổ

## Cốt truyện tóm tắt

- Chú Bảo (Đặng Quốc Bảo, 47 tuổi) giữ sổ giao hàng của Công ty Vận tải và Kho vận Hòa Bình
- Chú phát hiện quản lý Phạm Đức Long (52 tuổi) sửa số cân để rút thuốc giá cao bán chợ đen
- Chú chép tay số thật của 6 chuyến vào 6 trang rời đóng dấu quạ đen, giấu mỗi trang ở 1 nơi trên tuyến đường tuần cuối đi làm, rồi trốn trên gác lưu trữ nhà in Mực Tím
- Sổ gốc cả 6 chuyến đều ghi 240 kg
- Cân thật: 226, 224, 220, 222, 218, 214 kg (ngày 19/01, 21/01, 05/02, 11/02, 18/02, 25/02)
- Tổng lệch: 116 kg
- 6 địa điểm, 6 chương:
  - Chương 1: Căn phòng khóa trái ở hẻm 41 (nhà trọ Sáu Lành, hẻm 41, Q5)
  - Chương 2: Buổi chiếu cuối ở rạp Lệ Thanh
  - Chương 3: Tiệm radio Chính Phát ở Nhật Tảo
  - Chương 4: Chuyến xe đò lúc nửa đêm (Bến xe Chợ Lớn)
  - Chương 5: Nhà thuốc An Bình và lọ thuốc không nhãn (Q10)
  - Chương 6: Nhà in Mực Tím trong đêm cuối (Q1)
- Chi tiết đã chốt: két nhà thuốc mã 0312 (mã 4 số duy nhất của game), lọ thuốc 203 gram so với chuẩn 250 gram, câu 1.1 chốt cửa gài theo rãnh chữ L

## Công nghệ

- Front-end: HTML, CSS, JavaScript thuần, không framework
- Back-end: PHP thuần, API trả JSON, không framework
- Cơ sở dữ liệu: MySQL 8.0, bảng mã utf8mb4
- Chạy local: XAMPP trên Windows, hoặc PHP built-in server với MySQL trên Linux
- Không dùng localStorage làm nơi lưu chính, mọi tiến trình lưu lên MySQL

## Cấu trúc thư mục

```text
qua-den-game/
├── README.md
├── AGENTS.md
├── docs/
│   ├── 01-yeu-cau.md
│   ├── 02-kien-truc.md
│   ├── 03-csdl.md
│   ├── 04-api.md
│   ├── 05-huong-dan-chay.md
│   └── 06-ke-hoach.md
│   ├── 07-huong-dan-lam-viec.md
│   ├── 08-chia-viec-hoan-thanh.md
│   └── 09-vibe-coding.md
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── backend/
│   ├── index.php
│   ├── config.php
│   └── sql/
│       └── qua_den.sql
└── .gitignore
```

- `frontend/`: giao diện game, do agent front-end phụ trách
- `backend/`: API PHP và file SQL, do agent back-end phụ trách
- `docs/`: tài liệu theo chuẩn môn Công nghệ phần mềm, xem mục Tài liệu bên dưới

## Chạy nhanh

- Yêu cầu: PHP 8.x, MySQL 8.0 (XAMPP đã gồm cả hai)
- Bước 1: import cơ sở dữ liệu

```bash
mysql -u root -p < backend/db/schema.sql
mysql -u root -p < backend/db/seed.sql
```

- Bước 2: chạy back-end

```bash
cd backend
php -S localhost:8000
```

- Bước 3: mở front-end bằng Live Server hoặc mở trực tiếp file `frontend/index.html`
- Hướng dẫn đầy đủ, gồm cả bản Windows với XAMPP, xem [docs/05-huong-dan-chay.md](docs/05-huong-dan-chay.md)

## Nhóm thực hiện

| Vai trò | Thành viên |
| --- | --- |
| Trưởng nhóm | Đặng Hoàng Ân |
| Thành viên | Phan Hải Nam |
| Thành viên | Lê Nguyễn Nhật Đình |
| Thành viên | Nguyễn Ngọc Minh Thư |
| Thành viên | Nguyễn Lưu Quỳnh Nghi |
| Thành viên | Nguyễn Hoàng Anh |

## Tài liệu

- [01. Yêu cầu](docs/01-yeu-cau.md): yêu cầu chức năng, yêu cầu phi chức năng, use case, tiêu chí chấp nhận
- [02. Kiến trúc](docs/02-kien-truc.md): sơ đồ Front-end, Back-end, Database, luồng request, sequence đăng nhập và lưu game
- [03. Cơ sở dữ liệu](docs/03-csdl.md): 11 bảng, cột, khóa chính, khóa ngoại, quan hệ
- [04. API](docs/04-api.md): danh sách endpoint, tham số, ví dụ response
- [05. Hướng dẫn chạy](docs/05-huong-dan-chay.md): cài đặt và chạy trên Windows bằng XAMPP hoặc Laragon và trên Linux, xử lý lỗi thường gặp
- [06. Kế hoạch](docs/06-ke-hoach.md): tiến độ hiện tại và bước tiếp theo
- [07. Hướng dẫn làm việc nhóm](docs/07-huong-dan-lam-viec.md): chia file theo người, quy ước tách HTML/CSS với JS, quy trình nhánh và pull request để không xung đột
- [08. Chia việc để hoàn thành](docs/08-chia-viec-hoan-thanh.md): bảng chia việc đầy đủ theo code, giai đoạn 1 trước 19/11
- [09. Vibe coding](docs/09-vibe-coding.md): cách dùng AI để code trong nhóm, mẫu prompt cho từng người, lỗi thường gặp

## Trạng thái hiện tại

- Đã xong: kịch bản game 51 trang, thiết kế cơ sở dữ liệu ERD 11 bảng và 16 khóa ngoại, file SQL (`schema.sql` và `seed.sql` đủ 8 câu đố + 8 manh mối Chương 1)
- Đã xong: backend đủ 11/11 endpoint PHP + MySQL (`register`, `login`, `logout`, `chapters`, `chapter`, `inventory`, `pickup`, `solve`, `save`, `load`, `leaderboard`)
- Đã xong: giao diện responsive 4 trang, `api.js` session cookie, `auth.js`, `leaderboard.js` live 10s, `puzzle.js` tích hợp `game.html`, sơ đồ kiến trúc và ảnh chụp giao diện (`docs/screenshots/`)
- Đang làm: đồng bộ đồ họa phòng B/C, tên 6 chương và nối hoàn chỉnh túi đồ/lưu game trong `game.html`
- Chưa làm: code đầy đủ cả 6 chương của game, giao diện đầy đủ 20 phòng, toàn bộ 46 câu đố
- Chi tiết tiến độ xem [docs/06-ke-hoach.md](docs/06-ke-hoach.md)
