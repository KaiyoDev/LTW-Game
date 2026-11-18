# 02. Kiến trúc

## 2.1. Sơ đồ tổng thể

```text
+-----------------------------------------------------------------------+
|  TRÌNH DUYỆT (Front-end: frontend/)                                   |
|  HTML / CSS / JavaScript thuần (không framework, không build step)    |
|  - Trang: index.html, auth.html, game.html, leaderboard.html          |
|  - Giao diện: css/style.css                                           |
|  - Cấu hình & Logic: config.js, js/api.js, js/auth.js,                |
|                      js/leaderboard.js, js/puzzle.js, js/game.js      |
+-----------------------------------------------------------------------+
                  |
                  | HTTP GET / POST + JSON + Session Cookie (PHPSESSID)
                  | credentials: "include"
                  | URL: <API_BASE>/index.php?action=<tên>
                  v
+-----------------------------------------------------------------------+
|  BACK-END API (PHP thuần: backend/)                                   |
|  - backend/api/index.php : 1 router điều phối theo ?action=           |
|  - backend/config.php    : đọc .env, khởi tạo kết nối PDO (utf8mb4)   |
|  - Xác thực: password_hash / password_verify + PHP $_SESSION          |
+-----------------------------------------------------------------------+
                  |
                  | SQL Prepared Statement qua PDO (không nối chuỗi)
                  v
+-----------------------------------------------------------------------+
|  CƠ SỞ DỮ LIỆU (MySQL 8.0: qua_den)                                   |
|  - Tạo bảng: backend/db/schema.sql (11 bảng, 16 khóa ngoại, utf8mb4)  |
|  - Dữ liệu mẫu: backend/db/seed.sql (6 chương, 20 phòng, câu đố...)   |
+-----------------------------------------------------------------------+
```

- Front-end không kết nối trực tiếp với MySQL.
- Mọi thao tác đọc/ghi dữ liệu đều đi qua `frontend/js/api.js` tới `backend/api/index.php`.
- Back-end xác thực phiên đăng nhập, kiểm tra dữ liệu đầu vào rồi mới thực thi SQL bằng prepared statement và trả về JSON, không trả HTML.

## 2.2. Thành phần thực tế trong mã nguồn

### Front-end (`frontend/`)

- `index.html`: trang chủ giới thiệu cốt truyện, danh sách 6 chương, bảng xếp hạng thu nhỏ Chương 1.
- `auth.html`: màn hình đăng nhập và đăng ký tài khoản.
- `game.html`: màn chơi Chương 1 (3 phòng, di chuyển, nhặt đồ, giải câu đố, khung trò chuyện nhân vật, lưu/tải game).
- `leaderboard.html`: bảng xếp hạng theo từng chương (Chương 1 đến Chương 6), chế độ live tự tải lại mỗi 10 giây.
- `css/style.css`: giao diện responsive (PC, tablet, mobile) phong cách Rusty Lake Noir, Sài Gòn 1998, điểm nhấn vàng đồng `#d4a017`.
- `config.js`: khai báo địa chỉ gốc API mặc định `window.QUA_DEN_API_BASE = "http://localhost:8000/backend/api"` và chương hiện tại.
- `js/`:
  - `api.js`: lớp trung gian `window.QD` gọi API bằng `fetch` (`credentials: "include"`), chuẩn hóa URL, xử lý `401` và JSON/lỗi mạng; cung cấp đầy đủ hàm gọi 11 endpoint.
  - `auth.js`: kiểm tra form, gọi đăng ký/đăng nhập/đăng xuất qua `window.QD`, cập nhật thanh điều hướng (`navLogin`, `navRegister`, `navUser`, `navLogout`).
  - `leaderboard.js`: tải bảng xếp hạng từng chương qua `window.QD`, đổi tab chương, tự làm mới mỗi 10 giây và hiển thị giờ cập nhật.
  - `puzzle.js`: nạp manh mối từ `MANH_MOI` qua `action=chapter`, gửi đáp án qua `action=solve` và gắn tương tác giải đố vào `game.html`.
  - `game.js`: logic màn chơi Chương 1 (3 phòng, di chuyển qua cửa thật, hotspot câu 1.1/1.2/1.4/1.8, nhặt đồ `pickup`, lưu/tải game `save`/`load` và đồng bộ túi đồ `inventory`).

### Back-end (`backend/`)

- `api/index.php`: router API duy nhất, đọc tham số `?action=`, trả JSON kèm mã HTTP phù hợp.
  - Đủ 11 action đang chạy theo [04-api.md](04-api.md): `register`, `login`, `logout`, `chapters`, `chapter`, `inventory`, `pickup`, `solve`, `save`, `load`, `leaderboard` (GET và POST).
- `config.php`: đọc thông tin kết nối từ `.env` (mẫu tại `backend/.env.example`), tạo đối tượng `PDO` với bảng mã `utf8mb4`.
- `db/schema.sql`: tạo database `qua_den`, đủ 11 bảng, 16 khóa ngoại và dữ liệu khung chương 1.
- `db/seed.sql`: nạp dữ liệu mẫu cho 6 chương, 20 phòng, đồ vật, vật phẩm, câu đố và manh mối.

### Cơ sở dữ liệu (`qua_den`)

- 11 bảng, 16 khóa ngoại, xem chi tiết từng cột và quan hệ ở [03-csdl.md](03-csdl.md).
- Bảng mã `utf8mb4`, đối chiếu `utf8mb4_unicode_ci`.
- Khóa chính `INT AUTO_INCREMENT` (trừ 2 bảng khóa chính kép `TUI_DO` và `TIEN_DO_CAU_DO`).

## 2.3. Đường chạy thực tế và luồng request

- Đường dẫn API khi chạy local:
  - PHP built-in server (chạy `php -S localhost:8000` từ thư mục gốc project): `http://localhost:8000/backend/api/index.php?action=<tên>`
  - Laragon: `http://<ten-thu-muc>.test/backend/api/index.php?action=<tên>`
  - XAMPP: `http://localhost/<ten-thu-muc>/backend/api/index.php?action=<tên>`
- GET dùng cho hành động chỉ đọc: `chapters`, `chapter`, `load`, `inventory`, `leaderboard`.
- POST dùng cho hành động ghi dữ liệu hoặc xác thực: `register`, `login`, `logout`, `save`, `pickup`, `solve`, `leaderboard`.
- POST gửi body JSON với header `Content-Type: application/json`.
- Xác thực dùng session cookie PHP (`PHPSESSID`), không dùng token. Mọi request từ front-end kèm `credentials: "include"`.
- Dạng response thành công từ `backend/api/index.php`:

```json
{
  "ok": true,
  "data": {}
}
```

- Dạng response lỗi (kèm mã HTTP 400, 401, 404, 405, 409):

```json
{
  "ok": false,
  "error": "Ten dang nhap hoac mat khau sai."
}
```

- Front-end kiểm tra HTTP status và trường `ok`, nếu lỗi thì hiển thị thông báo tiếng Việt rõ ràng cho người chơi.

## 2.4. Sequence: đăng ký và đăng nhập

```text
Người chơi       Front-end (auth.js -> api.js)      Back-end (backend/api/index.php)      MySQL (qua_den)
    |                         |                                    |                             |
    | nhập form auth.html     |                                    |                             |
    |------------------------>| kiểm tra định dạng phía client     |                             |
    |                         | POST ?action=login                 |                             |
    |                         | {ten_dang_nhap, mat_khau}          |                             |
    |                         | (credentials: "include")           |                             |
    |                         |----------------------------------->|                             |
    |                         |                                    | SELECT ma_nguoi_choi,       |
    |                         |                                    |   ten_dang_nhap, mat_khau   |
    |                         |                                    | FROM NGUOI_CHOI             |
    |                         |                                    | WHERE ten_dang_nhap = ?     |
    |                         |                                    |---------------------------->|
    |                         |                                    |           1 dòng            |
    |                         |                                    |<----------------------------|
    |                         |                                    | password_verify()           |
    |                         |                                    | session_regenerate_id(true) |
    |                         |                                    | lưu $_SESSION['ma_nguoi_choi']
    |                         | HTTP 200 + Set-Cookie: PHPSESSID   |                             |
    |                         | {ok: true, data: {ma_nguoi_choi,   |                             |
    |                         |   ten_dang_nhap}}                  |                             |
    |                         |<-----------------------------------|                             |
    | cập nhật thanh nav,     |                                    |                             |
    | chuyển sang game.html   |                                    |                             |
    |<------------------------|                                    |                             |
```

- Khi đăng ký (`POST ?action=register`), back-end kiểm tra trùng `ten_dang_nhap` và `email`, băm mật khẩu bằng `password_hash`, ghi 1 dòng vào `NGUOI_CHOI`. Đăng ký thành công thì `auth.js` tự động gọi `POST ?action=login` rồi chuyển sang `game.html`.
- Session PHP giữ `ma_nguoi_choi` và `ten_dang_nhap`. Các endpoint cần đăng nhập gọi hàm `can_dang_nhap()` để kiểm tra `$_SESSION['ma_nguoi_choi']`.

## 2.5. Sequence: lưu game và tải bản lưu

```text
Người chơi       Front-end (game.html -> api.js)    Back-end (backend/api/index.php)      MySQL (qua_den)
    |                         |                                    |                             |
    | bấm Lưu game            |                                    |                             |
    |------------------------>| POST ?action=save                  |                             |
    |                         | {ma_chuong, ma_phong_hien_tai,     |                             |
    |                         |  thoi_gian_choi, so_goi_y_da_dung, |                             |
    |                         |  da_hoan_thanh, ma_luu,            |                             |
    |                         |  cau_do_da_giai: [...]}            |                             |
    |                         | (kèm cookie PHPSESSID)             |                             |
    |                         |----------------------------------->|                             |
    |                         |                                    | can_dang_nhap()             |
    |                         |                                    | INSERT hoặc UPDATE LUU_GAME |
    |                         |                                    |---------------------------->|
    |                         |                                    | INSERT ... ON DUPLICATE KEY |
    |                         |                                    | UPDATE TIEN_DO_CAU_DO       |
    |                         |                                    |---------------------------->|
    |                         | HTTP 200                           |                             |
    |                         | {ok: true, data: {ma_luu, ...}}    |                             |
    |                         |<-----------------------------------|                             |
    | báo đã lưu              |                                    |                             |
    |<------------------------|                                    |                             |
```

- Khi tải lại (`GET ?action=load` hoặc `GET ?action=load&ma_luu=<id>`), back-end đọc bản lưu từ `LUU_GAME` thuộc người chơi trong session cùng danh sách tiến độ từ `TIEN_DO_CAU_DO`.
- Túi đồ người chơi lưu trong bảng `TUI_DO` theo khóa chính kép `(ma_nguoi_choi, ma_vat_pham)` và được thao tác qua các endpoint `inventory` và `pickup`.

## 2.6. Sequence: bảng xếp hạng chế độ live

```text
Người chơi       Front-end (leaderboard.js -> api.js)  Back-end (backend/api/index.php)   MySQL (qua_den)
    |                           |                                    |                           |
    | mở trang / bấm tab chương |                                    |                           |
    |-------------------------->| GET ?action=leaderboard&ma_chuong=N|                           |
    |                           |----------------------------------->|                           |
    |                           |                                    | SELECT BANG_XEP_HANG      |
    |                           |                                    | JOIN NGUOI_CHOI           |
    |                           |                                    | ORDER BY                  |
    |                           |                                    | thoi_gian_hoan_thanh ASC  |
    |                           |                                    |-------------------------->|
    |                           |                                    |      danh sách xếp hạng   |
    |                           |                                    |<--------------------------|
    |                           | HTTP 200                           |                           |
    |                           | {ok: true, data: [{hang,           |                           |
    |                           |   ten_dang_nhap,                   |                           |
    |                           |   thoi_gian_hoan_thanh,            |                           |
    |                           |   ngay_ghi_nhan}, ...]}            |                           |
    |                           |<-----------------------------------|                           |
    | hiện bảng + giờ cập nhật  |                                    |                           |
    |<--------------------------|                                    |                           |
    |                           | (mỗi 10 giây tự lặp lại GET nếu    |                           |
    |                           |  tab đang mở)                      |                           |
```

## 2.7. Quy tắc kiến trúc

- Không có SQL trong file JS, không có HTML trong file PHP.
- Front-end không bao giờ nhận mật khẩu băm hay cột `dap_an` của bảng `CAU_DO`; đáp án chỉ được đối chiếu ở phía server trong action `solve`.
- Mọi input từ người dùng đều đi qua prepared statement PDO.
- Không thêm bảng mới ngoài 11 bảng ERD đã chốt khi chưa thống nhất với trưởng nhóm.
- Mỗi file JS chỉ thao tác trên các `id` HTML ổn định, không tự thay đổi cấu trúc DOM hay CSS của giao diện.
- Mọi lời gọi API từ front-end đi tập trung qua `frontend/js/api.js`.
