# 07. Hướng dẫn làm việc nhóm

Quy tắc làm việc chung của Nhóm 5 trên repo LTW-Game, để 6 người làm song song mà không xung đột code của nhau.

## 1. Nguyên tắc

- Nhánh `main` lúc nào cũng chạy được. Không ai push thẳng lên `main`.
- Mỗi việc làm trên 1 nhánh riêng, xong thì tạo pull request, Ân duyệt rồi mới merge.
- Không sửa file của người khác khi chưa hỏi người đó.
- Commit nhỏ, mỗi commit chỉ làm 1 việc, ghi rõ làm gì.
- Không dùng force push.

## 2. Chia file theo người

| Người | Làm phần | File phụ trách |
| --- | --- | --- |
| Ân | Giao diện | `frontend/index.html`, `frontend/auth.html`, `frontend/game.html`, `frontend/leaderboard.html`, `frontend/css/style.css`, `frontend/config.js` |
| Nam | Trang chủ, đăng nhập, bảng xếp hạng (JS) | `frontend/js/auth.js`, `frontend/js/leaderboard.js` |
| Đình | Nội dung game, phòng, hotspot | `frontend/js/game.js` (tách từ `game.html` khi cần), dữ liệu phòng trong `backend/db/seed.sql` |
| Thư | Vật phẩm, túi đồ | `frontend/js/api.js` phần inventory và pickup, CRUD vật phẩm |
| Nghi | Câu đố, manh mối, gợi ý | `frontend/js/` phần giải đố, dữ liệu câu đố trong `backend/db/seed.sql` |
| Hoàng Anh | Backend, Database | `backend/api/index.php`, `backend/config.php`, `backend/db/schema.sql`, `backend/db/seed.sql` |

Lưu ý: `backend/db/seed.sql` có 2 người cùng đụng (Đình và Nghi và Hoàng Anh). Ai thêm dữ liệu thì thêm vào cuối file, theo đúng khối của chương mình làm, không sửa khối của chương khác.

## 3. Quy ước tách HTML/CSS với JS

Ân làm giao diện (HTML và CSS), các bạn khác tự làm JS. Để không giẫm nhau:

- Ân giữ id của các phần tử ổn định. JS chỉ được gọi đúng id Ân đã đặt, không tự đổi id trong HTML.
- Người làm JS không sửa file HTML và CSS. Cần thêm nút mới hay ô nhập mới thì báo Ân thêm id vào HTML rồi mới viết JS.
- JS không được đổi cấu trúc DOM của Ân (không xóa thẻ, không đổi class giao diện). Chỉ được đổi nội dung chữ và trạng thái hiển thị.
- Mọi hàm gọi API đi qua `frontend/js/api.js`, không viết fetch rải rác trong từng file JS.
- Ai viết JS mới thì đặt tên file theo đúng phần mình làm, không viết chung vào 1 file của người khác.
- Danh sách `id` khung trò chuyện mới thêm ở `frontend/game.html` cho nhóm JS: `btnChat`, `chatOverlay`, `chatCard`, `chatAvatar`, `chatSpeaker`, `chatRole`, `chatBody`, `chatChoices`, `chatNext`, `chatClose`.

## 4. Quy ước API

- Base URL local: `http://localhost:8000/backend/api`, chạy `php -S localhost:8000` từ thư mục gốc project.
- Đăng nhập dùng session cookie PHP, không dùng token. Mọi fetch phải kèm `credentials: "include"`.
- Gọi API bằng `?action=<tên>`, trả JSON dạng `{ "ok": true, "data": ... }` hoặc `{ "ok": false, "error": "..." }`.
- Danh sách action đầy đủ xem trong `docs/04-api.md`. Cần thêm action mới thì báo Hoàng Anh thêm ở backend trước, rồi mới viết JS gọi nó.
- Không bao giờ để lộ cột `dap_an` ra API. Đáp án chỉ đối chiếu ở phía server trong action `solve`.

## 5. Quy trình làm việc từng bước

1. Clone repo lần đầu: `git clone https://github.com/KaiyoDev/LTW-Game.git`
2. Trước khi làm việc mới, lấy code mới nhất: `git checkout main` rồi `git pull`
3. Tạo nhánh riêng cho việc của mình: `git checkout -b ten-viec`, ví dụ `nam-auth`, `dinh-chuong-2`, `nghi-cau-do-ch1`
4. Code trong file của mình, theo đúng bảng ở mục 2
5. Chạy thử local trước khi commit:
   - Import Database: `mysql -u root -p < backend/db/schema.sql` rồi `mysql -u root -p < backend/db/seed.sql` (chỉ chạy 1 lần trên Database mới)
   - Chạy server: `php -S localhost:8000` từ thư mục gốc project
   - Mở frontend, bấm thử đúng phần mình làm, kiểm tra không lỗi console
6. Commit: `git add <file của mình>` rồi `git commit -m "<loại>: <việc đã làm>"`, ví dụ `feat: them cau do 1.3 chuong 1`
7. Push nhánh: `git push origin ten-viec`
8. Tạo pull request về `main`, ghi rõ đã test gì
9. Ân review, nếu ok thì merge, rồi xóa nhánh đó
10. Mọi người pull `main` mới nhất trước khi làm việc tiếp theo

## 6. Tránh xung đột

- Luôn pull `main` mới nhất trước khi bắt đầu việc mới.
- Không làm 2 việc trên cùng 1 nhánh.
- Không sửa cùng 1 file với người khác trong cùng 1 lúc. Nếu bắt buộc phải sửa chung file (như `seed.sql`) thì báo nhau trước, người sau pull code người trước về rồi mới sửa tiếp.
- Nếu gặp conflict khi merge, không tự sửa bừa. Giữ lại cả 2 phần, báo Ân xử lý.
- File `.env` không commit lên git. Mỗi người tự copy `.env.example` thành `.env` trên máy mình.
- Commit message viết tiếng Việt không dấu, bắt đầu bằng loại việc: `feat`, `fix`, `docs`, ví dụ `fix: sua loi dang nhap sai mat khau`.

## 7. Checklist trước khi tạo pull request

- [ ] Chỉ sửa file trong phần của mình
- [ ] `php -l` pass nếu sửa file PHP
- [ ] `node --check` pass nếu sửa file JS
- [ ] Đã chạy thử local, phần mình làm bấm được thật
- [ ] Không để lộ `dap_an` hay mật khẩu trong code và commit
- [ ] Không có file rác, không commit file `.env`
