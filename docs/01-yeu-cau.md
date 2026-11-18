# 01. Yêu cầu

## 1.1. Phạm vi

- Sản phẩm: game point and click giải đố chạy trên trình duyệt, 1 vụ án duy nhất, 6 chương, 20 phòng, 46 câu đố
- Người chơi: 1 người chơi tại 1 thời điểm, chơi trên trình duyệt máy tính
- Hệ thống lưu tài khoản, tiến trình chơi, túi đồ, tiến độ câu đố và bảng xếp hạng lên MySQL
- Ngoài phạm vi: chơi nhiều người cùng lúc, chơi trên điện thoại, thanh toán, chat

## 1.2. Yêu cầu chức năng

### Tài khoản

- FR01: người chơi đăng ký tài khoản bằng tên đăng nhập, mật khẩu, email
- FR02: người chơi đăng nhập bằng tên đăng nhập và mật khẩu
- FR03: hệ thống kiểm tra tên đăng nhập trùng và email trùng khi đăng ký
- FR04: mật khẩu lưu ở dạng băm, không lưu mật khẩu dạng text thuần
- FR05: người chơi đăng xuất, phiên đăng nhập hết hiệu lực sau khi đăng xuất

### Chơi game

- FR06: người chơi xem danh sách 6 chương theo đúng thứ tự
- FR07: người chơi chọn chương đã mở khóa để chơi, chương sau chỉ mở khi xong chương trước
- FR08: người chơi di chuyển giữa các phòng bằng cách đi bộ qua cửa thật, không nhảy cảnh
- FR09: người chơi click vào đồ vật để xem mô tả và nhặt vào túi đồ
- FR10: người chơi xem túi đồ, dùng vật phẩm lên đồ vật hoặc câu đố
- FR11: người chơi giải câu đố, nhập đáp án hoặc thao tác đúng thì câu đố hoàn thành
- FR12: người chơi xem gợi ý cho câu đố, mỗi gợi ý đã dùng được đếm vào `so_goi_y_da_dung`
- FR13: người chơi tìm được trang sổ thì chương kết thúc, hệ thống mở chương tiếp theo
- FR14: người chơi xem lại nội dung trang sổ đã tìm được

### Lưu game

- FR15: người chơi lưu tiến trình: chương hiện tại, phòng hiện tại, thời gian chơi, số gợi ý đã dùng, túi đồ, câu đố đã giải
- FR16: người chơi tải lại bản lưu và tiếp tục đúng phòng, đúng đồ đã nhặt, đúng câu đã giải
- FR17: hệ thống cho phép nhiều bản lưu cho 1 người chơi, mỗi bản lưu là 1 dòng trong bảng LUU_GAME
- FR18: người chơi xóa bản lưu của mình

### Bảng xếp hạng

- FR19: hệ thống ghi 1 dòng vào bảng xếp hạng mỗi khi người chơi hoàn thành 1 chương
- FR20: người chơi xem bảng xếp hạng theo từng chương, xếp theo thời gian hoàn thành tăng dần
- FR21: chơi lại 1 chương sẽ ghi thêm dòng mới, không ghi đè dòng cũ

### Nội dung game

- FR22: dữ liệu 6 chương, 20 phòng, 46 câu đố lấy từ cơ sở dữ liệu, không hard-code trong file JS
- FR23: đáp án câu đố kiểm tra ở back-end, không kiểm tra ở front-end
- FR24: két nhà thuốc chỉ mở bằng mã 0312
- FR25: lọ thuốc ở chương 5 là 203 gram, thiếu 47 gram so với chuẩn 250 gram
- FR26: câu 1.1 chỉ giải được bằng cách kéo chốt theo rãnh chữ L

## 1.3. Yêu cầu phi chức năng

- NFR01: trang game tải xong trong 3 giây ở mạng nội bộ
- NFR02: mọi request API trả về trong 2 giây ở dữ liệu thử nghiệm
- NFR03: hệ thống chịu được ít nhất 50 người chơi đăng ký và lưu game cùng lúc ở bản demo
- NFR04: mật khẩu băm bằng `password_hash` của PHP, không lưu mật khẩu dạng text thuần
- NFR05: mọi câu SQL dùng prepared statement, không nối chuỗi trực tiếp từ input người dùng
- NFR06: giao diện chạy được trên Chrome và Edge bản mới nhất, màn hình 1366x768 trở lên
- NFR07: dữ liệu nhập vào được kiểm tra ở cả front-end và back-end
- NFR08: lỗi back-end trả về JSON có `ok: false` và `error`, không lộ câu SQL hay đường dẫn file
- NFR09: mã nguồn chia rõ 3 lớp: front-end, back-end API, cơ sở dữ liệu
- NFR10: toàn bộ text trong game dùng tiếng Việt có dấu, bảng mã utf8mb4

## 1.4. Use case

### UC01: Đăng ký tài khoản

- Actor: khách
- Tiền điều kiện: chưa có tài khoản
- Luồng chính:
  - Khách nhập tên đăng nhập, mật khẩu, email
  - Hệ thống kiểm tra tên đăng nhập chưa tồn tại, email chưa tồn tại
  - Hệ thống băm mật khẩu, ghi 1 dòng vào bảng NGUOI_CHOI
  - Hệ thống trả về thành công, chuyển sang màn hình đăng nhập
- Luồng phụ: tên đăng nhập hoặc email đã tồn tại, hệ thống báo lỗi và yêu cầu nhập lại

### UC02: Đăng nhập

- Actor: người chơi
- Tiền điều kiện: đã có tài khoản
- Luồng chính:
  - Người chơi nhập tên đăng nhập và mật khẩu
  - Hệ thống kiểm tra mật khẩu bằng `password_verify`
  - Hệ thống tạo phiên đăng nhập, trả về `ma_nguoi_choi` và `ten_dang_nhap`
- Luồng phụ: sai tên đăng nhập hoặc sai mật khẩu, hệ thống báo lỗi chung, không nói rõ sai trường nào

### UC03: Chơi 1 chương

- Actor: người chơi đã đăng nhập
- Tiền điều kiện: chương đã mở khóa
- Luồng chính:
  - Người chơi chọn chương, hệ thống tải danh sách phòng, đồ vật, câu đố của chương
  - Người chơi di chuyển giữa các phòng qua cửa
  - Người chơi nhặt vật phẩm, giải câu đố
  - Người chơi tìm được trang sổ, chương kết thúc
- Luồng phụ: người chơi thoát giữa chừng, hệ thống hỏi có lưu game không

### UC04: Lưu game và tải lại

- Actor: người chơi đã đăng nhập
- Tiền điều kiện: đang chơi 1 chương
- Luồng chính:
  - Người chơi bấm lưu, hệ thống ghi 1 dòng vào LUU_GAME, ghi túi đồ vào TUI_DO, ghi tiến độ câu đố vào TIEN_DO_CAU_DO
  - Người chơi tải lại bản lưu, hệ thống khôi phục đúng chương, phòng hiện tại, túi đồ, câu đố đã giải
- Luồng phụ: chưa có bản lưu nào, hệ thống báo danh sách trống

### UC05: Xem bảng xếp hạng

- Actor: người chơi
- Tiền điều kiện: không cần đăng nhập
- Luồng chính:
  - Người chơi chọn chương, hệ thống lấy danh sách từ BANG_XEP_HANG, xếp theo `thoi_gian_hoan_thanh` tăng dần
  - Hệ thống hiển thị tên đăng nhập, thời gian hoàn thành, ngày ghi nhận

### UC06: Quản lý vật phẩm (chức năng nền tảng cho demo)

- Actor: người chơi đã đăng nhập
- Tiền điều kiện: đã nhặt ít nhất 1 vật phẩm
- Luồng chính:
  - Người chơi xem túi đồ, hệ thống lấy từ TUI_DO nối với VAT_PHAM
  - Người chơi dùng vật phẩm lên câu đố, hệ thống kiểm tra `ma_vat_pham_can` của câu đố
  - Dùng đúng vật phẩm thì câu đố cho phép giải, dùng sai thì báo chưa đúng

## 1.5. Tiêu chí chấp nhận

- AC01: đăng ký với tên đăng nhập mới thành công, đăng ký trùng tên báo lỗi
- AC02: đăng nhập đúng mật khẩu vào được game, sai mật khẩu không vào được
- AC03: chơi hết chương 1, tìm được trang sổ số 1, chương 2 mở khóa
- AC04: lưu game giữa chương, tải lại, đúng phòng hiện tại, đúng đồ đã nhặt, đúng câu đã giải
- AC05: hoàn thành 1 chương, bảng xếp hạng có thêm 1 dòng đúng `ma_chuong` và `thoi_gian_hoan_thanh`
- AC06: nhập mã két khác 0312 không mở được két, nhập 0312 mở được
- AC07: dữ liệu lưu thật trong MySQL, kiểm tra bằng câu SELECT thấy đúng dòng vừa tạo
- AC08: tắt trình duyệt rồi mở lại, bản lưu vẫn còn, không mất tiến trình

## 1.6. Tổng hợp trạng thái chức năng hiện tại

- **Đã xong:**
  - Tài khoản (FR01–FR05): đăng ký, kiểm tra trùng username/email, băm mật khẩu `password_hash`/`password_verify`, đăng nhập và đăng xuất bằng PHP session cookie (`PHPSESSID`, `credentials: "include"`).
  - API nền tảng: đủ 11/11 endpoint (`register`, `login`, `logout`, `chapters`, `chapter`, `inventory`, `pickup`, `solve`, `save`, `load`, `leaderboard`) trong `backend/api/index.php`.
  - Bảng xếp hạng (FR19–FR21): xem theo từng chương (1–6), chế độ live tự làm mới 10 giây trong `frontend/js/leaderboard.js`.
  - Dữ liệu Chương 1 (FR22–FR23): đủ 8 câu đố, 8 manh mối và danh sách `DO_VAT` trong `backend/db/seed.sql`; đối chiếu đáp án ở server qua `action=solve` (không lộ `dap_an` qua API `chapter`); tích hợp `frontend/js/puzzle.js` và `frontend/js/game.js` vào `frontend/game.html`.
  - Màn chơi & Lưu game Chương 1 (FR08–FR11, FR15–FR16): `frontend/js/game.js` đi đủ 3 phòng qua cửa thật, giải 4 câu `1.1, 1.2, 1.4, 1.8` qua `solve`, nhặt đồ qua `pickup`, đồng bộ túi đồ `inventory` (hiển thị số lượng) và lưu/tải game qua `save`/`load`.
  - Giao diện nền tảng: 4 trang (`index.html`, `auth.html`, `game.html`, `leaderboard.html`) responsive kèm ảnh chụp minh chứng trong `docs/screenshots/`.
- **Đang làm:**
  - Đồng bộ lại hình nền phòng B, phòng C và tên 6 chương thống nhất giữa giao diện và `seed.sql`.
- **Chưa làm:**
  - Nội dung đầy đủ Chương 2 đến Chương 6 (17 phòng còn lại và 38 câu đố còn lại).
  - Kiểm thử tổng thể xuyên suốt cả 6 chương từ đầu đến cuối.
