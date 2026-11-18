# 06. Kế hoạch

## 6.1. Tiến độ hiện tại

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Kịch bản game | Đã xong | 51 trang, 6 chương, 20 phòng, 46 câu đố, 24 đoạn thoại, 16 nhân vật, đã rà logic 3 vòng |
| Thiết kế cơ sở dữ liệu ERD | Đã xong | 11 bảng, 16 khóa ngoại, file SQL, DBML, JSON, Excel, PDF |
| Báo cáo tiến độ lần 1 | Đã xong | File Word và bộ slide 11 trang, phân công từng thành viên |
| Tài liệu dự án | Đã xong | README và docs 01 tới 06 trong thư mục này |
| Demo Chương 1 | Đang làm | Giao diện 4 trang đã xong; `seed.sql` đủ 8 câu đố và 8 manh mối Chương 1; `puzzle.js` đã tích hợp vào `game.html`; còn đồng bộ ảnh phòng B/C và nối đầy đủ túi đồ/lưu game |
| API nền tảng | Đã xong | Đủ 11/11 action (`register`, `login`, `logout`, `chapters`, `chapter`, `inventory`, `pickup`, `solve`, `save`, `load`, `leaderboard`) trong `backend/api/index.php`, đã test curl trên DB mới |
| Front-end nền tảng | Đang hoàn thiện | HTML/CSS responsive 4 trang; `config.js` trỏ `http://localhost:8000/backend/api`; `api.js` dùng session cookie (`credentials: "include"`); `auth.js`, `leaderboard.js` live 10s và `puzzle.js` đã xong; còn nối `save`/`load`/`pickup` trong `game.html` |
| Tài liệu kiến trúc & ảnh chụp | Đã xong | Cập nhật sơ đồ kiến trúc `docs/02-kien-truc.md` và bộ ảnh 4 trang trong `docs/screenshots/` |
| Code đầy đủ 6 chương | Chưa làm | Mới có chương 1, còn chương 2 tới chương 6 |
| Giao diện đủ 20 phòng | Chưa làm | Mới có 3 phòng chương 1, còn 17 phòng |
| Toàn bộ 46 câu đố | Chưa làm | Mới có 8 câu đố chương 1, còn 38 câu đố |
| Dữ liệu mẫu đầy đủ | Chưa làm | Mới có dữ liệu mẫu chương 1, còn dữ liệu chương 2 tới chương 6 |
| Kiểm thử tổng thể | Chưa làm | Chưa test chơi hết 6 chương từ đầu tới cuối |

## 6.2. Phân công

| Thành viên | Phụ trách |
| --- | --- |
| Đặng Hoàng Ân (trưởng nhóm) | Điều phối, báo cáo, slide 1, tổng hợp |
| Phan Hải Nam | Thiết kế, slide 1, 2, 3 |
| Lê Nguyễn Nhật Đình | Chương và phòng, slide 4, 5 |
| Nguyễn Ngọc Minh Thư | Vật phẩm và túi đồ, slide 6, 7 |
| Nguyễn Lưu Quỳnh Nghi | Câu đố và manh mối, slide 8, 9 |
| Nguyễn Hoàng Anh | Lưu game và ERD, slide 10, 11 |

## 6.3. Bước tiếp theo

- Bước 1 (Đã xong): hoàn thành API nền tảng, đủ 11 action trong [04-api.md](04-api.md), test bằng curl trước khi nối front-end
- Bước 2 (Đang hoàn thiện): đã xong `api.js` session cookie, `auth.js`, `leaderboard.js` live 10s, `puzzle.js`; còn nối hoàn chỉnh `save`/`load`/`pickup` trong `game.html` với API thật
- Bước 3: đồng bộ lại đồ họa phòng B/C, tên 6 chương và nối hoàn chỉnh túi đồ/lưu game để demo Chương 1 chơi được trọn vẹn từ đầu tới cuối, tìm được trang sổ số 1, mở khóa chương 2
- Bước 4: kiểm chứng dữ liệu lưu thật trong MySQL, lưu game rồi tải lại đúng phòng, đúng đồ, đúng câu đã giải
- Bước 5: làm tiếp chương 2 và chương 3, gồm phòng, đồ vật, câu đố, dữ liệu mẫu
- Bước 6: làm tiếp chương 4, chương 5, chương 6, gồm két mã 0312 ở chương 5 và bản in thử dính mực tím ở chương 6
- Bước 7: nhập đủ dữ liệu mẫu 20 phòng và 46 câu đố vào database
- Bước 8: test chơi hết 6 chương từ đầu tới cuối, sửa lỗi, ghi bảng xếp hạng theo từng chương
- Bước 9: hoàn thiện giao diện, kiểm thử trên Chrome và Edge, chuẩn bị báo cáo tiến độ lần 2

## 6.4. Rủi ro

- Rủi ro: nhóm đổi chủ đề giữa chừng, từ web hẹn hò sang game, nên thời gian làm code bị rút ngắn
- Cách xử lý: làm trước bản demo tối thiểu, gồm đăng ký, đăng nhập, lưu game, bảng xếp hạng, rồi mới làm tiếp nội dung game
- Rủi ro: dữ liệu 46 câu đố nhiều, nhập tay dễ sai đáp án
- Cách xử lý: nhập dữ liệu mẫu theo từng chương, test ngay sau khi nhập xong 1 chương
- Rủi ro: đáp án câu đố lộ ở front-end
- Cách xử lý: đáp án chỉ kiểm tra ở back-end, front-end không bao giờ nhận `dap_an` từ API
- Rủi ro: mất bản lưu khi người chơi tắt trình duyệt giữa chừng
- Cách xử lý: nút lưu game rõ ràng, hỏi lưu trước khi thoát chương, bản lưu ghi đủ 3 bảng trong 1 transaction
