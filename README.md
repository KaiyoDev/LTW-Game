# Quạ Đen: Sáu Vụ Án Sài Gòn 1998

Game point-and-click giải đố phong cách Rusty Lake Noir, xây dựng bằng **HTML, CSS, JavaScript thuần** ở front-end, **PHP thuần (PDO)** ở back-end và **MySQL 8.0 / MariaDB** làm cơ sở dữ liệu (không dùng framework, không build step).

## Mục lục

- [Tổng quan & Cốt truyện](#tổng-quan--cốt-truyện)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ & Kiến trúc](#công-nghệ--kiến-trúc)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Hướng dẫn cài đặt & chạy local](#hướng-dẫn-cài-đặt--chạy-local)
- [API Backend (11 endpoints)](#api-backend-11-endpoints)
- [Ảnh chụp giao diện](#ảnh-chụp-giao-diện)
- [Trạng thái hiện tại](#trạng-thái-hiện-tại)
- [Nhóm thực hiện & Tài liệu](#nhóm-thực-hiện--tài-liệu)

---

## Tổng quan & Cốt truyện

- **Môn học:** Lập trình website (LTWEB)
- **Giảng viên hướng dẫn:** ThS. Trần Thịnh Mạnh Đức
- **Nhóm thực hiện:** Nhóm 5 (6 thành viên)
- **Quy mô thiết kế:** 1 vụ án duy nhất, 6 chương, 20 phòng, 46 câu đố

**Bối cảnh:** Sài Gòn năm 1998. **Chú Bảo** (Đặng Quốc Bảo, 47 tuổi), người giữ sổ giao hàng của Công ty Vận tải và Kho vận Hòa Bình, phát hiện quản lý **Phạm Đức Long** (52 tuổi) sửa số cân để rút thuốc giá cao đem bán chợ đen. Trước khi biến mất, chú chép tay số cân thật của 6 chuyến hàng (226, 224, 220, 222, 218, 214 kg so với sổ gốc 240 kg, tổng lệch 116 kg) vào 6 trang rời đóng dấu quạ đen và giấu dọc tuyến đường làm việc cuối cùng.

Người chơi vào vai **Đặng Minh An** (22 tuổi, sinh viên báo chí, cháu ruột chú Bảo), chạy đua từ sáng 10/03 đến 09:00 sáng 11/03/1998 để tìm đủ 6 trang sổ trước giờ kiểm tra sổ:

1. **Chương 1:** Căn phòng khóa trái ở hẻm 41 (Nhà trọ Sáu Lành, Q5)
2. **Chương 2:** Buổi chiếu cuối ở rạp Lệ Thanh
3. **Chương 3:** Tiệm radio Chính Phát ở Nhật Tảo
4. **Chương 4:** Chuyến xe đò lúc nửa đêm (Bến xe Chợ Lớn)
5. **Chương 5:** Nhà thuốc An Bình và lọ thuốc không nhãn (Q10, mã két `0312`, lọ thuốc 203g/250g)
6. **Chương 6:** Nhà in Mực Tím trong đêm cuối (Q1)

---

## Tính năng chính

- **Tài khoản & Phiên đăng nhập:** Đăng ký, đăng nhập, đăng xuất dùng `password_hash` / `password_verify` và PHP session cookie (`PHPSESSID`, `credentials: "include"`).
- **Màn chơi Chương 1 (Demo):** Di chuyển giữa 3 phòng, tương tác hotspot, nhặt vật phẩm, xem manh mối từ `MANH_MOI` và đối chiếu đáp án câu đố hoàn toàn ở server (không lộ `dap_an` ra API/front-end).
- **Bảng xếp hạng Live:** Xếp hạng theo từng chương (1 đến 6), tự động làm mới mỗi 10 giây kèm giờ cập nhật thực tế.
- **Lưu trữ MySQL:** Toàn bộ tài khoản, bản lưu game, túi đồ, tiến độ câu đố và bảng xếp hạng lưu trực tiếp trên MySQL qua PDO prepared statement.

---

## Công nghệ & Kiến trúc

| Thành phần | Công nghệ | Chi tiết |
| --- | --- | --- |
| Front-end | HTML5, CSS3, Vanilla JS | Giao diện responsive 4 trang, không framework, gọi API tập trung qua `frontend/js/api.js` |
| Back-end | PHP 8.x (PDO) | 1 router duy nhất `backend/api/index.php?action=<tên>`, trả JSON `{ ok, data / error }` |
| Database | MySQL 8.0 / MariaDB (`utf8mb4`) | Database `qua_den` gồm 11 bảng, 16 khóa ngoại |
| Môi trường local | PHP built-in server / XAMPP / Laragon | Xem chi tiết tại [docs/05-huong-dan-chay.md](docs/05-huong-dan-chay.md) |

---

## Cấu trúc thư mục

```text
LTW-Game/
├── README.md
├── AGENTS.md                       # Quy ước kỹ thuật cho thành viên và AI agent
├── backend/
│   ├── .env.example                # Mẫu cấu hình kết nối DB (copy thành .env khi chạy)
│   ├── config.php                  # Đọc .env, khởi tạo kết nối PDO (utf8mb4)
│   ├── README.md                   # Tài liệu & kết quả test 11 endpoint
│   ├── api/
│   │   └── index.php               # Router API duy nhất (?action=...)
│   └── db/
│       ├── schema.sql              # Tạo DB qua_den (11 bảng, 16 khóa ngoại)
│       └── seed.sql                # Dữ liệu mẫu 6 chương, 20 phòng, 8 câu đố + manh mối Ch.1
├── frontend/
│   ├── config.js                   # Cấu hình QUA_DEN_API_BASE mặc định
│   ├── index.html                  # Trang chủ: cốt truyện, 6 chương, BXH thu nhỏ
│   ├── auth.html                   # Đăng nhập & Đăng ký
│   ├── game.html                   # Màn chơi Chương 1 (3 phòng)
│   ├── leaderboard.html            # Bảng xếp hạng theo chương (chế độ live 10s)
│   ├── css/
│   │   └── style.css               # Giao diện Rusty Lake Noir responsive
│   └── js/
│       ├── api.js                  # Lớp gọi API (session cookie, xử lý 401/lỗi mạng)
│       ├── auth.js                 # Validate form, đăng nhập/đăng ký/đăng xuất, nav
│       ├── leaderboard.js          # BXH theo chương, auto-refresh 10s
│       └── puzzle.js               # Nạp manh mối MANH_MOI và giải đố qua action=solve
└── docs/
    ├── 01-yeu-cau.md               # Yêu cầu chức năng, phi chức năng, use case, trạng thái
    ├── 02-kien-truc.md             # Sơ đồ kiến trúc và sequence diagrams
    ├── 03-csdl.md                  # Chi tiết 11 bảng CSDL
    ├── 04-api.md                   # Đặc tả API
    ├── 05-huong-dan-chay.md        # Hướng dẫn cài đặt XAMPP / Laragon / Linux
    ├── 06-ke-hoach.md              # Bảng tiến độ và kế hoạch tiếp theo
    ├── 07-huong-dan-lam-viec.md    # Quy trình Git/PR và phân chia file
    ├── 08-chia-viec-hoan-thanh.md  # Bảng đầu việc chi tiết từng thành viên
    ├── 09-vibe-coding.md           # Hướng dẫn dùng AI trong nhóm
    └── screenshots/                # Ảnh chụp 4 trang giao diện chính
```

---

## Hướng dẫn cài đặt & chạy local

### Yêu cầu
- PHP 8.x (bật extension `pdo_mysql`, `mbstring`)
- MySQL 8.0 hoặc MariaDB 10.11+ (có sẵn trong XAMPP / Laragon)

### Các bước chạy nhanh (PHP built-in server)

1. **Tạo file cấu hình DB:**
   Copy `backend/.env.example` thành `backend/.env` và điền thông tin MySQL của bạn (`DB_HOST`, `DB_NAME=qua_den`, `DB_USER`, `DB_PASS`).
2. **Import cơ sở dữ liệu:**
   ```bash
   mysql -u root -p < backend/db/schema.sql
   mysql -u root -p < backend/db/seed.sql
   ```
3. **Khởi động server từ thư mục gốc dự án:**
   ```bash
   php -S localhost:8000
   ```
4. **Mở trình duyệt:**
   Truy cập `http://localhost:8000/frontend/index.html` (chạy cùng cổng `8000` với API `http://localhost:8000/backend/api` trong `frontend/config.js` để cookie session hoạt động ổn định).

> Nếu chạy bằng **XAMPP** hoặc **Laragon**, xem hướng dẫn chi tiết và cách xử lý lỗi tại [docs/05-huong-dan-chay.md](docs/05-huong-dan-chay.md).

### Kiểm tra cú pháp nhanh
```bash
php -l backend/api/index.php backend/config.php
node --check frontend/js/api.js frontend/js/auth.js frontend/js/leaderboard.js frontend/js/puzzle.js
```

---

## API Backend (11 endpoints)

Mọi endpoint gọi qua `backend/api/index.php?action=<tên>`, trả JSON `{ "ok": true, "data": ... }` hoặc `{ "ok": false, "error": "..." }`:

| Action | Method | Đăng nhập | Mô tả |
| --- | --- | --- | --- |
| `register` | `POST` | Không | Đăng ký tài khoản mới (`NGUOI_CHOI`) |
| `login` | `POST` | Không | Đăng nhập, mở PHP session |
| `logout` | `POST` | Không | Đăng xuất, hủy session & cookie |
| `chapters` | `GET` | Không | Danh sách 6 chương kèm số phòng |
| `chapter` | `GET` | Không | Chi tiết 1 chương, phòng, đồ vật, câu đố, manh mối (không trả `dap_an`) |
| `inventory` | `GET` | Có | Lấy túi đồ của người chơi (`TUI_DO`) |
| `pickup` | `POST` | Có | Nhặt vật phẩm vào túi đồ (nhặt trùng tăng `so_luong`) |
| `solve` | `POST` | Có | Đối chiếu đáp án ở server, ghi tiến độ và thưởng vật phẩm |
| `save` | `POST` | Có | Lưu tiến trình vào `LUU_GAME` + `TIEN_DO_CAU_DO` |
| `load` | `GET` | Có | Tải bản lưu mới nhất hoặc theo `ma_luu` |
| `leaderboard` | `GET`/`POST` | `POST` cần | Xem bảng xếp hạng theo chương / ghi điểm hoàn thành |

---

## Ảnh chụp giao diện

Xem bộ ảnh thực tế 4 trang chính trong [docs/screenshots/README.md](docs/screenshots/README.md):
- Trang chủ (`frontend/index.html`): [01-trang-chu.png](docs/screenshots/01-trang-chu.png)
- Đăng nhập / Đăng ký (`frontend/auth.html`): [02-dang-nhap-dang-ky.png](docs/screenshots/02-dang-nhap-dang-ky.png)
- Bảng xếp hạng live (`frontend/leaderboard.html`): [03-bang-xep-hang.png](docs/screenshots/03-bang-xep-hang.png)
- Màn chơi Chương 1 (`frontend/game.html`): [04-man-choi-chuong-1.png](docs/screenshots/04-man-choi-chuong-1.png)

---

## Trạng thái hiện tại

- **Đã xong:**
  - Kịch bản game 51 trang, thiết kế CSDL ERD 11 bảng / 16 khóa ngoại (`schema.sql`), dữ liệu Chương 1 đủ 8 câu đố và 8 manh mối (`seed.sql`).
  - Backend PHP + MySQL hoàn thiện đủ 11/11 endpoint.
  - Giao diện responsive 4 trang, `api.js` (session cookie + xử lý `401`), `auth.js`, `leaderboard.js` (live 10s), `puzzle.js` tích hợp `game.html`, sơ đồ kiến trúc và ảnh chụp giao diện.
- **Đang làm:**
  - Đồng bộ lại đồ họa phòng B/C, thống nhất tên 6 chương giữa giao diện và `seed.sql`, nối hoàn chỉnh `save`/`load`/`pickup` trong `game.html`.
- **Chưa làm:**
  - Nội dung và màn chơi đầy đủ cho Chương 2 đến Chương 6 (17 phòng và 38 câu đố còn lại) cùng kiểm thử tổng thể cả 6 chương.

Chi tiết tiến độ và kế hoạch xem tại [docs/06-ke-hoach.md](docs/06-ke-hoach.md) và [docs/01-yeu-cau.md](docs/01-yeu-cau.md).

---

## Nhóm thực hiện & Tài liệu

| Thành viên | Vai trò / Phần phụ trách |
| --- | --- |
| Đặng Hoàng Ân | Trưởng nhóm, giao diện HTML/CSS, điều phối & tổng hợp |
| Phan Hải Nam | Trang chủ, đăng nhập (`auth.js`), bảng xếp hạng (`leaderboard.js`), kiến trúc & ảnh chụp |
| Lê Nguyễn Nhật Đình | Demo Chương 1 và phòng chơi |
| Nguyễn Ngọc Minh Thư | Vật phẩm và túi đồ |
| Nguyễn Lưu Quỳnh Nghi | Câu đố, đáp án và manh mối (`seed.sql`, `puzzle.js`) |
| Nguyễn Hoàng Anh | Backend API (`backend/api/index.php`) và Database |

### Danh mục tài liệu
- [01. Yêu cầu](docs/01-yeu-cau.md)
- [02. Kiến trúc](docs/02-kien-truc.md)
- [03. Cơ sở dữ liệu](docs/03-csdl.md)
- [04. API](docs/04-api.md)
- [05. Hướng dẫn chạy](docs/05-huong-dan-chay.md)
- [06. Kế hoạch](docs/06-ke-hoach.md)
- [07. Hướng dẫn làm việc nhóm](docs/07-huong-dan-lam-viec.md)
- [08. Chia việc để hoàn thành](docs/08-chia-viec-hoan-thanh.md)
- [09. Vibe coding](docs/09-vibe-coding.md)
