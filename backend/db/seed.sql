-- seed.sql
-- Du lieu mau cho game Qua Den, chay SAU file db/schema.sql, chi chay 1 lan tren DB moi.
--   mysql -u root -p qua_den < db/schema.sql
--   mysql -u root -p qua_den < db/seed.sql
-- File schema.sql da chen san 6 chuong, 3 phong chuong 1 va 8 cau do chuong 1
-- (ten khong dau). File nay viet lai ten co dau dung cot truyen, them phong,
-- do vat, vat pham, cau do va manh moi cho du 6 chuong.
-- Ma ket sat nha thuoc 0312 chi nam trong cot dap_an o DB, API khong bao gio
-- tra dap_an ra ngoai, chi doi chieu o phia server khi lam endpoint solve.

USE qua_den;

-- 1. Viet lai ten 6 chuong co dau, dung cot truyen.
UPDATE CHUONG SET
  ten_chuong = 'Can phong khoa trai o hem 41',
  mo_ta = 'Nha tro Sau Lanh, hem 41 Nguyen Trai, Q5. Sang 10/03/1998, 08:00-09:40.'
WHERE ma_chuong = 1;
UPDATE CHUONG SET
  ten_chuong = 'Buoi chieu cuoi o rap Le Thanh',
  mo_ta = 'Rap Le Thanh, Cho Lon. Trua 10/03/1998, 10:30-12:10.'
WHERE ma_chuong = 2;
UPDATE CHUONG SET
  ten_chuong = 'Tiem radio Chinh Phat o Nhat Tao',
  mo_ta = 'Tiem radio Chinh Phat. Chieu 10/03/1998, 14:00-16:20.'
WHERE ma_chuong = 3;
UPDATE CHUONG SET
  ten_chuong = 'Chuyen xe do luc nua dem',
  mo_ta = 'Ben xe Cho Lon. Dem 10/03/1998, 23:10-00:30.'
WHERE ma_chuong = 4;
UPDATE CHUONG SET
  ten_chuong = 'Nha thuoc An Binh va lo thuoc khong nhan',
  mo_ta = 'Nha thuoc An Binh, Q10. Rang sang 11/03/1998, 05:00-07:10.'
WHERE ma_chuong = 5;
UPDATE CHUONG SET
  ten_chuong = 'Nha in Muc Tim trong dem cuoi',
  mo_ta = 'Nha in Muc Tim, Q1. Sang 11/03/1998, 07:30-09:00, truoc gio kiem tra so 09:00.'
WHERE ma_chuong = 6;

-- 2. Viet lai ten 3 phong chuong 1 co dau.
UPDATE PHONG SET ten_phong = 'Phong tro so 4' WHERE ma_phong = 1;
UPDATE PHONG SET ten_phong = 'Hanh lang va cau thang' WHERE ma_phong = 2;
UPDATE PHONG SET ten_phong = 'San thuong phoi do' WHERE ma_phong = 3;

-- 3. Them phong cho chuong 2 den chuong 6. Tong cong du 20 phong.
INSERT INTO PHONG (ma_phong, ma_chuong, ten_phong, thu_tu) VALUES
(4, 2, 'Sanh rap', 1),
(5, 2, 'Phong chieu so 2', 2),
(6, 2, 'Phong may chieu', 3),
(7, 2, 'Hanh lang rap', 4),
(8, 3, 'Mat tien tiem', 1),
(9, 3, 'Gian trong sua chua', 2),
(10, 3, 'Kho linh kien', 3),
(11, 4, 'San ben', 1),
(12, 4, 'Phong ve', 2),
(13, 4, 'Quan nuoc dem', 3),
(14, 5, 'Quay thuoc', 1),
(15, 5, 'Kho thuoc', 2),
(16, 5, 'Phong sau nha thuoc', 3),
(17, 6, 'Xuong in', 1),
(18, 6, 'Phong che ban', 2),
(19, 6, 'Gac luu tru', 3),
(20, 6, 'San sau nha in', 4);

-- 4. Do vat dat trong cac phong. vi_tri_x, vi_tri_y la toa do de frontend dat do vat len anh nen.
INSERT INTO DO_VAT (ma_do_vat, ma_phong, ten_do_vat, vi_tri_x, vi_tri_y) VALUES
(1, 1, 'Cua phong tro so 4', 120, 300),
(2, 1, 'Hop thiec duoi gam giuong', 200, 420),
(3, 1, 'Tu ao go', 500, 200),
(4, 2, 'Buc anh gia dinh', 260, 150),
(5, 3, 'Chau cay giay', 400, 320),
(6, 3, 'Guong cam tay', 180, 260),
(7, 6, 'May chieu phim', 400, 180),
(8, 9, 'Radio hong', 250, 300),
(9, 12, 'Bang gio xe chay', 200, 150),
(10, 14, 'Ket sat nha thuoc', 350, 200),
(11, 14, 'Lo thuoc khong nhan', 420, 300),
(12, 19, 'Con dau qua den', 320, 200);

-- 5. Vat pham nhat duoc. Trang so 1 den 6 la thuong khi giai xong cau do cuoi moi chuong.
INSERT INTO VAT_PHAM (ma_vat_pham, ten_vat_pham, mo_ta, ma_do_vat) VALUES
(1, 'Chia dong', 'Chia dong nhat tu chau cay giay o san thuong phoi do.', 5),
(2, 'Trang so so 1', 'Trang so tay chep so can that chuyen 19/01: 226 kg.', NULL),
(3, 'Trang so so 2', 'Trang so tay chep so can that chuyen 21/01: 224 kg.', NULL),
(4, 'Trang so so 3', 'Trang so tay chep so can that chuyen 05/02: 220 kg.', NULL),
(5, 'Trang so so 4', 'Trang so tay chep so can that chuyen 11/02: 222 kg.', NULL),
(6, 'Trang so so 5', 'Trang so tay chep so can that chuyen 18/02: 218 kg.', NULL),
(7, 'Trang so so 6', 'Trang so tay chep so can that chuyen 25/02: 214 kg.', NULL),
(8, 'Lo thuoc khong nhan', 'Lo thuoc chi con 203 gram, thieu 47 gram so voi chuan 250 gram.', 11),
(9, 'Moc ao uon cong', 'Moc ao sat uon cong, luon duoc xuong gam giuong.', 3),
(10, 'Guong cam tay', 'Guong nho, hung nang soi duoc cho toi.', 6);

-- 6. Bo sung mo ta, dap an va vat pham cho 4 cau do chuong 1 trong schema.sql.
UPDATE CAU_DO SET
  mo_ta = 'Chot cua gai theo ranh chu L, keo chot men theo ranh moi mo duoc cua.',
  dap_an = 'keo chot theo ranh chu L'
WHERE ma_cau_do = 1;
UPDATE CAU_DO SET
  mo_ta = 'Hop thiec nam sau duoi gam giuong, tay khong voi toi.',
  dap_an = 'moc ao uon cong',
  ma_vat_pham_can = 9
WHERE ma_cau_do = 2;
UPDATE CAU_DO SET
  mo_ta = 'Chau cay giay xoay duoc theo vet xuoc tren thanh chau.',
  dap_an = 'xoay chau cay',
  ma_vat_pham_thuong = 1
WHERE ma_cau_do = 4;
UPDATE CAU_DO SET
  mo_ta = 'Noi doi nguoi la qua cua phong.',
  dap_an = 'noi doi nguoi la qua',
  ma_vat_pham_thuong = 2
WHERE ma_cau_do = 8;

-- 7. Cau do mau cho chuong 2 den chuong 6, moi chuong 2 cau.
-- Thanh vien phu trach cot truyen bo sung them cau do theo kich ban 46 cau.
INSERT INTO CAU_DO (ma_cau_do, ma_phong, ten_cau_do, thu_tu, mo_ta, dap_an, ma_vat_pham_can, ma_vat_pham_thuong) VALUES
(9, 4, 'Ve xem phim cu rach mot goc', 1, 'Ve xem phim buoi chieu cuoi, goc ve rach dung cho ghi ten.', NULL, NULL, NULL),
(10, 5, 'Man chieu rach lo ngan bi mat', 2, 'Man chieu rach mot duong dai, phia sau co ngan nho.', NULL, NULL, 3),
(11, 8, 'Radio hong khong len tieng', 1, 'Radio cua khach gui sua, bat khong len tieng.', NULL, NULL, NULL),
(12, 9, 'Go nhip theo tieng chuong', 2, 'Cau do go nhip duy nhat cua game, go lai dung nhip chuong.', '3-1-2', NULL, 4),
(13, 11, 'Ve xe do nhoe so ghe', 1, 'Ve xe do chuyen nua dem, so ghe bi nhoe khong doc duoc.', NULL, NULL, NULL),
(14, 13, 'So ghi chep cua tai xe thieu mot trang', 2, 'So ghi chep chuyen xe dem thieu dung trang ngay 25/02.', NULL, NULL, 5),
(15, 14, 'Ket sat nha thuoc', 1, 'Ket sat 4 so cua nha thuoc An Binh.', '0312', NULL, NULL),
(16, 14, 'Lo thuoc khong nhan thieu 47 gram', 2, 'Lo thuoc khong nhan, can chi con 203 gram.', '203 gram', NULL, 6),
(17, 17, 'May in cu ket giay', 1, 'May in o xuong in ket giay, can thao dung trinh tu.', NULL, NULL, NULL),
(18, 19, 'Gac luu tru toi khong thay duong', 2, 'Gac luu tru nha in Muc Tim, noi chu Bao tron.', 'leo len tu xuong in', NULL, 7);

-- 8. Manh moi goi y cho mot so cau do.
INSERT INTO MANH_MOI (ma_manh_moi, ma_cau_do, noi_dung) VALUES
(1, 1, 'Ranh chu L chi co mot duong di duy nhat, keo chot men theo ranh.'),
(2, 4, 'Xoay chau cay theo vet xuoc, ben duoi co chia dong.'),
(3, 12, 'Nghe ky tieng chuong roi go lai dung nhip.'),
(4, 15, 'Ma ket co 4 so, goi y nam trong ngan keo quay thuoc.'),
(5, 16, 'Lo thuoc nhe hon chuan 47 gram, do la bang chung Long rut thuoc.'),
(6, 18, 'Gac luu tru la noi chu Bao tron, leo len tu xuong in.');

-- 9. Nghi bo sung dap an va manh moi cho 4 cau do Chuong 1 con thieu (1.3, 1.5, 1.6, 1.7) va manh moi Chuong 1.
UPDATE CAU_DO SET
  mo_ta = 'Buc anh gia dinh cu treo o hanh lang, mat sau co chu viet tay, phai soi den moi doc duoc.',
  dap_an = 'soi den'
WHERE ma_cau_do = 3;

UPDATE CAU_DO SET
  mo_ta = 'Cuon bang cat-xet ghi lai tieng mua tren mai ton va tieng chuong chua luc nua dem.',
  dap_an = 'tieng mua va tieng chuong'
WHERE ma_cau_do = 5;

UPDATE CAU_DO SET
  mo_ta = 'Trong tu ao go co to giay cu gap theo nep, mo theo dung nep de doc dieu chu Bao ghi.',
  dap_an = 'gap theo nep cu'
WHERE ma_cau_do = 6;

UPDATE CAU_DO SET
  mo_ta = 'Dung guong cam tay o san thuong, hung anh nang chieu sang khe toi duoi bon nuoc.',
  dap_an = 'hung nang vao khe toi',
  ma_vat_pham_can = 10
WHERE ma_cau_do = 7;

-- Bo sung manh moi cho cac cau do Chuong 1 con thieu (cau 2, 3, 5, 6, 7, 8).
INSERT INTO MANH_MOI (ma_cau_do, noi_dung) VALUES
(2, 'Hop thiec nam sau duoi gam giuong, can thu gi dai va cong nhu chiec moc ao de keo ra.'),
(3, 'Mat sau buc anh gia dinh co chu viet tay, phai soi den moi doc ro.'),
(5, 'Nghe ky cuon bang de phan biet tieng mua va tieng chuong chua.'),
(6, 'To giay giau trong tu ao go duoc gap lai theo nep cu, mo dung nep se thay noi dung.'),
(7, 'Dung guong cam tay hung anh nang mat troi de chieu sang khe toi duoi bon nuoc.'),
(8, 'Khi nguoi la ngoai cua hoi, hay noi doi nguoi la qua de lay trang so so 1.');
