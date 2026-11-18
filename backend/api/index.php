<?php
// api/index.php
// Router API cho game Qua Den. Chay bang PHP co san, khong dung framework.
// Cach goi: /backend/api/?action=ten_endpoint
// Vi du: GET  /backend/api/?action=chapters
//         POST /backend/api/?action=login
// Moi tra loi deu la JSON dang { ok: true, data: ... }
// hoac { ok: false, error: "..." }, kem ma HTTP dung.
//
// DANH SACH 11 ENDPOINT (da chay duoc):
//   register    POST  dang ky tai khoan moi, bang NGUOI_CHOI
//   login       POST  dang nhap, mo session
//   logout      POST  dang xuat, huy session
//   chapter     GET   chi tiet 1 chuong: phong, do vat, cau do, manh moi (khong co dap_an)
//   inventory   GET   tui do cua nguoi choi (can dang nhap)
//   pickup      POST  nhat vat pham vao tui do (can dang nhap)
//   solve       POST  giai cau do, doi chieu dap an o server (can dang nhap)
//   save        POST  luu game, bang LUU_GAME + TIEN_DO_CAU_DO (can dang nhap)
//   load        GET   tai ban luu moi nhat, kem tien do cau do (can dang nhap)
//   leaderboard GET   xem bang xep hang theo chuong
//   leaderboard POST  ghi diem len bang xep hang, bang BANG_XEP_HANG (can dang nhap)
//   chapters    GET   danh sach 6 chuong, kem so phong

require __DIR__ . '/../config.php';

// Bat session de giu dang nhap. Frontend goi fetch kem credentials: 'include'.
session_start();

// CORS cho frontend chay o cong khac khi dev o local.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Lay ten action tu ?action=, neu khong co thi lay tu duong dan sau /api/.
$action = $_GET['action'] ?? '';
if ($action === '' && isset($_SERVER['PATH_INFO'])) {
    $action = trim($_SERVER['PATH_INFO'], '/');
}

// Tra loi JSON thanh cong.
function tra_loi($data, $ma = 200) {
    http_response_code($ma);
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

// Tra loi JSON loi.
function tra_loi_loi($thong_bao, $ma = 400) {
    http_response_code($ma);
    echo json_encode(['ok' => false, 'error' => $thong_bao], JSON_UNESCAPED_UNICODE);
    exit;
}

// Loi bat ngo (vi du loi SQL) van tra JSON, khong lo chi tiet ra ngoai.
set_exception_handler(function ($loi) {
    error_log($loi->getMessage());
    tra_loi_loi('Loi may chu.', 500);
});

// Doc du lieu gui len: uu tien JSON, neu khong co thi lay $_POST.
function doc_du_lieu() {
    $raw = file_get_contents('php://input');
    if ($raw !== '' && $raw !== false) {
        $du_lieu = json_decode($raw, true);
        if (is_array($du_lieu)) {
            return $du_lieu;
        }
    }
    return $_POST;
}

// Chan endpoint can dang nhap. Tra ve ma_nguoi_choi neu da dang nhap.
function can_dang_nhap() {
    if (empty($_SESSION['ma_nguoi_choi'])) {
        tra_loi_loi('Chua dang nhap.', 401);
    }
    return (int) $_SESSION['ma_nguoi_choi'];
}

// Chuan hoa chuoi nhap: cat khoang trang hai dau, doi thanh chu thuong.
function chuan_hoa($chuoi) {
    $chuoi = trim($chuoi);
    $chuoi = preg_replace('/\s+/', ' ', $chuoi);
    return mb_strtolower($chuoi, 'UTF-8');
}

// Bo dau tieng Viet, doi chu thuong: "Móc Áo" -> "moc ao".
// Dung de so dap an co dau va khong dau cho giong nhau.
function bo_dau($chuoi) {
    $co_dau = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';
    $khong_dau = str_repeat('a', 17) . str_repeat('e', 11) . str_repeat('i', 5) .
        str_repeat('o', 17) . str_repeat('u', 11) . str_repeat('y', 5) . 'd';
    $bang = array_combine(mb_str_split($co_dau, 1, 'UTF-8'), str_split($khong_dau));
    return strtr(chuan_hoa($chuoi), $bang);
}

// =====================================================================
// POST ?action=register
// Dang ky tai khoan moi.
// Gui len: { ten_dang_nhap, mat_khau, email }
// Tra ve: { ma_nguoi_choi, ten_dang_nhap, email }
// Ghi chu cho thanh vien: mat khau luu bang password_hash, khong bao gio
// luu mat khau dang chu thuong. Ten dang nhap va email la duy nhat trong DB.
// =====================================================================
if ($action === 'register') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        tra_loi_loi('Chi chap nhan POST.', 405);
    }
    $du_lieu = doc_du_lieu();
    $ten_dang_nhap = trim($du_lieu['ten_dang_nhap'] ?? '');
    $mat_khau = $du_lieu['mat_khau'] ?? '';
    $email = trim($du_lieu['email'] ?? '');

    if ($ten_dang_nhap === '' || $mat_khau === '') {
        tra_loi_loi('Thieu ten dang nhap hoac mat khau.');
    }
    if (strlen($ten_dang_nhap) < 3 || strlen($ten_dang_nhap) > 50) {
        tra_loi_loi('Ten dang nhap dai tu 3 den 50 ky tu.');
    }
    if (strlen($mat_khau) < 6) {
        tra_loi_loi('Mat khau it nhat 6 ky tu.');
    }
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        tra_loi_loi('Email khong dung dinh dang.');
    }

    $kiem = $pdo->prepare('SELECT ma_nguoi_choi FROM NGUOI_CHOI WHERE ten_dang_nhap = ?');
    $kiem->execute([$ten_dang_nhap]);
    if ($kiem->fetch()) {
        tra_loi_loi('Ten dang nhap da co nguoi dung.', 409);
    }
    if ($email !== '') {
        $kiem = $pdo->prepare('SELECT ma_nguoi_choi FROM NGUOI_CHOI WHERE email = ?');
        $kiem->execute([$email]);
        if ($kiem->fetch()) {
            tra_loi_loi('Email da co nguoi dung.', 409);
        }
    }

    $mat_khau_ma_hoa = password_hash($mat_khau, PASSWORD_DEFAULT);
    $them = $pdo->prepare('INSERT INTO NGUOI_CHOI (ten_dang_nhap, mat_khau, email) VALUES (?, ?, ?)');
    $them->execute([$ten_dang_nhap, $mat_khau_ma_hoa, $email === '' ? null : $email]);

    tra_loi([
        'ma_nguoi_choi' => (int) $pdo->lastInsertId(),
        'ten_dang_nhap' => $ten_dang_nhap,
        'email' => $email,
    ], 201);
}

// =====================================================================
// POST ?action=login
// Dang nhap. Gui len: { ten_dang_nhap, mat_khau }
// Tra ve: { ma_nguoi_choi, ten_dang_nhap }
// Ghi chu cho thanh vien: password_verify doi chieu voi password_hash trong DB.
// Neu sau nay muon them logout thi huy session bang session_destroy().
// =====================================================================
if ($action === 'login') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        tra_loi_loi('Chi chap nhan POST.', 405);
    }
    $du_lieu = doc_du_lieu();
    $ten_dang_nhap = trim($du_lieu['ten_dang_nhap'] ?? '');
    $mat_khau = $du_lieu['mat_khau'] ?? '';

    if ($ten_dang_nhap === '' || $mat_khau === '') {
        tra_loi_loi('Thieu ten dang nhap hoac mat khau.');
    }

    $tim = $pdo->prepare('SELECT ma_nguoi_choi, ten_dang_nhap, mat_khau FROM NGUOI_CHOI WHERE ten_dang_nhap = ?');
    $tim->execute([$ten_dang_nhap]);
    $nguoi_choi = $tim->fetch();

    if ($nguoi_choi === false || !password_verify($mat_khau, $nguoi_choi['mat_khau'])) {
        tra_loi_loi('Ten dang nhap hoac mat khau sai.', 401);
    }

    session_regenerate_id(true);
    $_SESSION['ma_nguoi_choi'] = (int) $nguoi_choi['ma_nguoi_choi'];
    $_SESSION['ten_dang_nhap'] = $nguoi_choi['ten_dang_nhap'];

    tra_loi([
        'ma_nguoi_choi' => (int) $nguoi_choi['ma_nguoi_choi'],
        'ten_dang_nhap' => $nguoi_choi['ten_dang_nhap'],
    ]);
}

// =====================================================================
// GET ?action=chapters
// Danh sach 6 chuong, moi chuong kem so phong va so cau do.
// Khong can dang nhap. Frontend dung de ve man hinh chon chuong.
// =====================================================================
if ($action === 'chapters') {
    $lay = $pdo->query(
        'SELECT c.ma_chuong, c.ten_chuong, c.thu_tu, c.mo_ta,' .
        ' (SELECT COUNT(*) FROM PHONG p WHERE p.ma_chuong = c.ma_chuong) AS so_phong,' .
        ' (SELECT COUNT(*) FROM CAU_DO d JOIN PHONG p ON p.ma_phong = d.ma_phong WHERE p.ma_chuong = c.ma_chuong) AS so_cau_do' .
        ' FROM CHUONG c ORDER BY c.thu_tu ASC'
    );
    tra_loi($lay->fetchAll());
}

// =====================================================================
// POST ?action=save
// Luu game. Can dang nhap.
// Gui len: { ma_chuong, ma_phong_hien_tai, thoi_gian_choi,
//            so_goi_y_da_dung, da_hoan_thanh, ma_luu, cau_do_da_giai }
//   ma_luu: co thi cap nhat ban luu cu, khong co thi tao ban luu moi.
//   cau_do_da_giai: mang ma_cau_do da giai xong, vd [1, 2, 4].
// Tra ve: { ma_luu, ma_chuong, ma_phong_hien_tai, thoi_gian_choi,
//           so_goi_y_da_dung, da_hoan_thanh }
// Ghi chu cho thanh vien: TIEN_DO_CAU_DO chi ghi ma_cau_do da giai,
// khong ghi dap_an. Endpoint solve sau nay se la noi duy nhat doi chieu dap_an.
// =====================================================================
if ($action === 'save') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        tra_loi_loi('Chi chap nhan POST.', 405);
    }
    $ma_nguoi_choi = can_dang_nhap();
    $du_lieu = doc_du_lieu();

    $ma_chuong = (int) ($du_lieu['ma_chuong'] ?? 0);
    $ma_phong = isset($du_lieu['ma_phong_hien_tai']) ? (int) $du_lieu['ma_phong_hien_tai'] : null;
    $thoi_gian_choi = (int) ($du_lieu['thoi_gian_choi'] ?? 0);
    $so_goi_y = (int) ($du_lieu['so_goi_y_da_dung'] ?? 0);
    $da_hoan_thanh = !empty($du_lieu['da_hoan_thanh']) ? 1 : 0;
    $ma_luu = isset($du_lieu['ma_luu']) ? (int) $du_lieu['ma_luu'] : 0;

    if ($ma_chuong <= 0) {
        tra_loi_loi('Thieu ma_chuong.');
    }
    $kiem_chuong = $pdo->prepare('SELECT ma_chuong FROM CHUONG WHERE ma_chuong = ?');
    $kiem_chuong->execute([$ma_chuong]);
    if ($kiem_chuong->fetch() === false) {
        tra_loi_loi('Chuong khong ton tai.', 404);
    }
    if ($ma_phong !== null && $ma_phong > 0) {
        $kiem_phong = $pdo->prepare('SELECT ma_phong FROM PHONG WHERE ma_phong = ? AND ma_chuong = ?');
        $kiem_phong->execute([$ma_phong, $ma_chuong]);
        if ($kiem_phong->fetch() === false) {
            tra_loi_loi('Phong khong thuoc chuong nay.', 400);
        }
    } else {
        $ma_phong = null;
    }

    if ($ma_luu > 0) {
        // Cap nhat ban luu cu, chi cho sua ban luu cua chinh minh.
        $kiem_luu = $pdo->prepare('SELECT ma_luu FROM LUU_GAME WHERE ma_luu = ? AND ma_nguoi_choi = ?');
        $kiem_luu->execute([$ma_luu, $ma_nguoi_choi]);
        if ($kiem_luu->fetch() === false) {
            tra_loi_loi('Ban luu khong ton tai hoac khong phai cua ban.', 404);
        }
        $cap_nhat = $pdo->prepare(
            'UPDATE LUU_GAME SET ma_chuong = ?, ma_phong_hien_tai = ?, thoi_gian_choi = ?,' .
            ' so_goi_y_da_dung = ?, da_hoan_thanh = ?, ngay_luu = NOW() WHERE ma_luu = ?'
        );
        $cap_nhat->execute([$ma_chuong, $ma_phong, $thoi_gian_choi, $so_goi_y, $da_hoan_thanh, $ma_luu]);
    } else {
        $them = $pdo->prepare(
            'INSERT INTO LUU_GAME (ma_nguoi_choi, ma_chuong, ma_phong_hien_tai, thoi_gian_choi, so_goi_y_da_dung, da_hoan_thanh)' .
            ' VALUES (?, ?, ?, ?, ?, ?)'
        );
        $them->execute([$ma_nguoi_choi, $ma_chuong, $ma_phong, $thoi_gian_choi, $so_goi_y, $da_hoan_thanh]);
        $ma_luu = (int) $pdo->lastInsertId();
    }

    // Dong bo tien do cau do neu frontend gui kem.
    $cau_do_da_giai = $du_lieu['cau_do_da_giai'] ?? [];
    if (is_array($cau_do_da_giai)) {
        $ghi_tien_do = $pdo->prepare(
            'INSERT INTO TIEN_DO_CAU_DO (ma_luu, ma_cau_do, da_hoan_thanh, ngay_giai)' .
            ' VALUES (?, ?, 1, NOW()) ON DUPLICATE KEY UPDATE da_hoan_thanh = 1, ngay_giai = NOW()'
        );
        foreach ($cau_do_da_giai as $ma_cau_do) {
            $ghi_tien_do->execute([$ma_luu, (int) $ma_cau_do]);
        }
    }

    tra_loi([
        'ma_luu' => $ma_luu,
        'ma_chuong' => $ma_chuong,
        'ma_phong_hien_tai' => $ma_phong,
        'thoi_gian_choi' => $thoi_gian_choi,
        'so_goi_y_da_dung' => $so_goi_y,
        'da_hoan_thanh' => (bool) $da_hoan_thanh,
    ]);
}

// =====================================================================
// GET ?action=load
// Tai ban luu. Can dang nhap.
// ?ma_luu= so cu the, hoac khong co thi lay ban luu moi nhat.
// Tra ve ban luu kem danh sach cau do da giai xong.
// =====================================================================
if ($action === 'load') {
    $ma_nguoi_choi = can_dang_nhap();
    $ma_luu = isset($_GET['ma_luu']) ? (int) $_GET['ma_luu'] : 0;

    if ($ma_luu > 0) {
        $tim = $pdo->prepare('SELECT * FROM LUU_GAME WHERE ma_luu = ? AND ma_nguoi_choi = ?');
        $tim->execute([$ma_luu, $ma_nguoi_choi]);
    } else {
        $tim = $pdo->prepare('SELECT * FROM LUU_GAME WHERE ma_nguoi_choi = ? ORDER BY ngay_luu DESC LIMIT 1');
        $tim->execute([$ma_nguoi_choi]);
    }
    $ban_luu = $tim->fetch();
    if ($ban_luu === false) {
        tra_loi_loi('Chua co ban luu nao.', 404);
    }

    $lay_tien_do = $pdo->prepare(
        'SELECT t.ma_cau_do, c.ten_cau_do, t.da_hoan_thanh, t.ngay_giai' .
        ' FROM TIEN_DO_CAU_DO t JOIN CAU_DO c ON c.ma_cau_do = t.ma_cau_do' .
        ' WHERE t.ma_luu = ? ORDER BY t.ma_cau_do ASC'
    );
    $lay_tien_do->execute([(int) $ban_luu['ma_luu']]);
    $ban_luu['tien_do_cau_do'] = $lay_tien_do->fetchAll();
    $ban_luu['ma_luu'] = (int) $ban_luu['ma_luu'];
    $ban_luu['ma_nguoi_choi'] = (int) $ban_luu['ma_nguoi_choi'];
    $ban_luu['ma_chuong'] = (int) $ban_luu['ma_chuong'];
    $ban_luu['ma_phong_hien_tai'] = $ban_luu['ma_phong_hien_tai'] === null ? null : (int) $ban_luu['ma_phong_hien_tai'];
    $ban_luu['thoi_gian_choi'] = (int) $ban_luu['thoi_gian_choi'];
    $ban_luu['so_goi_y_da_dung'] = (int) $ban_luu['so_goi_y_da_dung'];
    $ban_luu['da_hoan_thanh'] = (bool) $ban_luu['da_hoan_thanh'];

    tra_loi($ban_luu);
}

// =====================================================================
// ?action=leaderboard
// GET  ?action=leaderboard&ma_chuong=1&limit=10 : xem top theo chuong.
//      Xep theo thoi_gian_hoan_thanh tang dan, dung nhu ERD da chot.
// POST ?action=leaderboard : ghi diem, can dang nhap.
//      Gui len: { ma_chuong, thoi_gian_hoan_thanh }
// Ghi chu cho thanh vien: moi dong la 1 luot hoan thanh 1 chuong cua
// 1 nguoi choi, choi lai thi them dong moi, khong ghi de dong cu.
// =====================================================================
if ($action === 'leaderboard') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
        $ma_nguoi_choi = can_dang_nhap();
        $du_lieu = doc_du_lieu();
        $ma_chuong = (int) ($du_lieu['ma_chuong'] ?? 0);
        $thoi_gian = (int) ($du_lieu['thoi_gian_hoan_thanh'] ?? 0);

        if ($ma_chuong <= 0) {
            tra_loi_loi('Thieu ma_chuong.');
        }
        if ($thoi_gian <= 0) {
            tra_loi_loi('Thoi gian hoan thanh phai lon hon 0.');
        }
        $kiem_chuong = $pdo->prepare('SELECT ma_chuong FROM CHUONG WHERE ma_chuong = ?');
        $kiem_chuong->execute([$ma_chuong]);
        if ($kiem_chuong->fetch() === false) {
            tra_loi_loi('Chuong khong ton tai.', 404);
        }

        $them = $pdo->prepare(
            'INSERT INTO BANG_XEP_HANG (ma_nguoi_choi, ma_chuong, thoi_gian_hoan_thanh) VALUES (?, ?, ?)'
        );
        $them->execute([$ma_nguoi_choi, $ma_chuong, $thoi_gian]);

        tra_loi([
            'ma_xep_hang' => (int) $pdo->lastInsertId(),
            'ma_chuong' => $ma_chuong,
            'thoi_gian_hoan_thanh' => $thoi_gian,
        ], 201);
    }

    $ma_chuong = isset($_GET['ma_chuong']) ? (int) $_GET['ma_chuong'] : 0;
    $gioi_han = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
    if ($gioi_han < 1 || $gioi_han > 100) {
        $gioi_han = 10;
    }

    if ($ma_chuong > 0) {
        $lay = $pdo->prepare(
            'SELECT b.ma_xep_hang, b.ma_chuong, b.thoi_gian_hoan_thanh, b.ngay_ghi_nhan,' .
            ' n.ten_dang_nhap FROM BANG_XEP_HANG b' .
            ' JOIN NGUOI_CHOI n ON n.ma_nguoi_choi = b.ma_nguoi_choi' .
            ' WHERE b.ma_chuong = ? ORDER BY b.thoi_gian_hoan_thanh ASC LIMIT ' . $gioi_han
        );
        $lay->execute([$ma_chuong]);
    } else {
        $lay = $pdo->query(
            'SELECT b.ma_xep_hang, b.ma_chuong, b.thoi_gian_hoan_thanh, b.ngay_ghi_nhan,' .
            ' n.ten_dang_nhap FROM BANG_XEP_HANG b' .
            ' JOIN NGUOI_CHOI n ON n.ma_nguoi_choi = b.ma_nguoi_choi' .
            ' ORDER BY b.thoi_gian_hoan_thanh ASC LIMIT ' . $gioi_han
        );
    }
    $bang = $lay->fetchAll();
    $hang = 0;
    foreach ($bang as &$dong) {
        $hang++;
        $dong['hang'] = $hang;
        $dong['ma_xep_hang'] = (int) $dong['ma_xep_hang'];
        $dong['ma_chuong'] = (int) $dong['ma_chuong'];
        $dong['thoi_gian_hoan_thanh'] = (int) $dong['thoi_gian_hoan_thanh'];
    }
    unset($dong);
    tra_loi($bang);
}

// =====================================================================
// POST ?action=logout
// Dang xuat: xoa du lieu session va cookie session.
// =====================================================================
if ($action === 'logout') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        tra_loi_loi('Chi chap nhan POST.', 405);
    }
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $ck = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $ck['path'], $ck['domain'], $ck['secure'], $ck['httponly']);
    }
    session_destroy();
    tra_loi(null);
}

// =====================================================================
// GET ?action=chapter&ma_chuong=1
// Du lieu 1 chuong de choi: phong -> do vat (kem vat pham nhat duoc),
// cau do (kem manh moi). Khong can dang nhap.
// KHONG select cot dap_an. Dap an chi doi chieu o endpoint solve.
// =====================================================================
if ($action === 'chapter') {
    $ma_chuong = isset($_GET['ma_chuong']) ? (int) $_GET['ma_chuong'] : 0;
    if ($ma_chuong <= 0) {
        tra_loi_loi('Thieu ma_chuong.');
    }
    $lay = $pdo->prepare('SELECT ma_chuong, ten_chuong, thu_tu, mo_ta FROM CHUONG WHERE ma_chuong = ?');
    $lay->execute([$ma_chuong]);
    $chuong = $lay->fetch();
    if ($chuong === false) {
        tra_loi_loi('Chuong khong ton tai.', 404);
    }

    $lay = $pdo->prepare('SELECT ma_phong, ten_phong, thu_tu FROM PHONG WHERE ma_chuong = ? ORDER BY thu_tu ASC');
    $lay->execute([$ma_chuong]);
    $phong = $lay->fetchAll();

    $lay_do_vat = $pdo->prepare(
        'SELECT d.ma_do_vat, d.ten_do_vat, d.vi_tri_x, d.vi_tri_y,' .
        ' v.ma_vat_pham, v.ten_vat_pham, v.mo_ta AS mo_ta_vat_pham' .
        ' FROM DO_VAT d LEFT JOIN VAT_PHAM v ON v.ma_do_vat = d.ma_do_vat' .
        ' WHERE d.ma_phong = ? ORDER BY d.ma_do_vat ASC'
    );
    $lay_cau_do = $pdo->prepare(
        'SELECT ma_cau_do, ten_cau_do, thu_tu, mo_ta, ma_vat_pham_can, ma_vat_pham_thuong' .
        ' FROM CAU_DO WHERE ma_phong = ? ORDER BY thu_tu ASC'
    );
    $lay_manh_moi = $pdo->prepare('SELECT ma_manh_moi, noi_dung FROM MANH_MOI WHERE ma_cau_do = ? ORDER BY ma_manh_moi ASC');

    foreach ($phong as &$p) {
        $p['ma_phong'] = (int) $p['ma_phong'];
        $p['thu_tu'] = (int) $p['thu_tu'];

        $lay_do_vat->execute([$p['ma_phong']]);
        $p['do_vat'] = $lay_do_vat->fetchAll();

        $lay_cau_do->execute([$p['ma_phong']]);
        $p['cau_do'] = $lay_cau_do->fetchAll();
        foreach ($p['cau_do'] as &$c) {
            $lay_manh_moi->execute([(int) $c['ma_cau_do']]);
            $c['manh_moi'] = $lay_manh_moi->fetchAll();
        }
        unset($c);
    }
    unset($p);

    $chuong['phong'] = $phong;
    tra_loi($chuong);
}

// =====================================================================
// GET ?action=inventory
// Tui do cua nguoi dang nhap: TUI_DO join VAT_PHAM. Can dang nhap.
// =====================================================================
if ($action === 'inventory') {
    $ma_nguoi_choi = can_dang_nhap();
    $lay = $pdo->prepare(
        'SELECT v.ma_vat_pham, v.ten_vat_pham, v.mo_ta, t.so_luong, t.ngay_nhat' .
        ' FROM TUI_DO t JOIN VAT_PHAM v ON v.ma_vat_pham = t.ma_vat_pham' .
        ' WHERE t.ma_nguoi_choi = ? ORDER BY t.ngay_nhat ASC, v.ma_vat_pham ASC'
    );
    $lay->execute([$ma_nguoi_choi]);
    $tui_do = $lay->fetchAll();
    foreach ($tui_do as &$dong) {
        $dong['ma_vat_pham'] = (int) $dong['ma_vat_pham'];
        $dong['so_luong'] = (int) $dong['so_luong'];
    }
    unset($dong);
    tra_loi($tui_do);
}

// =====================================================================
// POST ?action=pickup
// Nhat vat pham. Gui len: { ma_vat_pham }. Can dang nhap.
// Chi nhat duoc vat pham nam tren 1 do vat trong phong (ma_do_vat khac NULL).
// Trang so thuong cua cau do khong nhat truc tiep, chi nhan qua solve.
// Nhat lai vat pham da co thi tang so_luong, khong tao dong moi.
// =====================================================================
if ($action === 'pickup') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        tra_loi_loi('Chi chap nhan POST.', 405);
    }
    $ma_nguoi_choi = can_dang_nhap();
    $du_lieu = doc_du_lieu();
    $ma_vat_pham = (int) ($du_lieu['ma_vat_pham'] ?? 0);
    if ($ma_vat_pham <= 0) {
        tra_loi_loi('Thieu ma_vat_pham.');
    }

    $tim = $pdo->prepare('SELECT ma_vat_pham, ten_vat_pham, ma_do_vat FROM VAT_PHAM WHERE ma_vat_pham = ?');
    $tim->execute([$ma_vat_pham]);
    $vat_pham = $tim->fetch();
    if ($vat_pham === false) {
        tra_loi_loi('Vat pham khong ton tai.', 404);
    }
    if ($vat_pham['ma_do_vat'] === null) {
        tra_loi_loi('Vat pham nay khong nhat truc tiep duoc.', 403);
    }

    $ghi = $pdo->prepare(
        'INSERT INTO TUI_DO (ma_nguoi_choi, ma_vat_pham, so_luong) VALUES (?, ?, 1)' .
        ' ON DUPLICATE KEY UPDATE so_luong = so_luong + 1, ngay_nhat = NOW()'
    );
    $ghi->execute([$ma_nguoi_choi, $ma_vat_pham]);

    $doc = $pdo->prepare('SELECT so_luong FROM TUI_DO WHERE ma_nguoi_choi = ? AND ma_vat_pham = ?');
    $doc->execute([$ma_nguoi_choi, $ma_vat_pham]);
    tra_loi([
        'ma_vat_pham' => $ma_vat_pham,
        'ten_vat_pham' => $vat_pham['ten_vat_pham'],
        'so_luong' => (int) $doc->fetchColumn(),
    ]);
}

// =====================================================================
// POST ?action=solve
// Giai cau do. Gui len: { ma_cau_do, dap_an, ma_luu (tuy chon) }. Can dang nhap.
// Day la cho DUY NHAT doi chieu dap_an. Dap an dung hay sai deu khong tra dap_an.
//   - Thieu vat pham can: loi 403.
//   - Sai dap an: ok true, correct false (HTTP 200).
//   - Dung: correct true, thuong vat pham (neu co) vao TUI_DO,
//     ghi TIEN_DO_CAU_DO neu co ma_luu cua chinh nguoi choi.
// So sanh khong phan biet hoa thuong, dau cach thua, co dau hay khong dau.
// =====================================================================
if ($action === 'solve') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        tra_loi_loi('Chi chap nhan POST.', 405);
    }
    $ma_nguoi_choi = can_dang_nhap();
    $du_lieu = doc_du_lieu();
    $ma_cau_do = (int) ($du_lieu['ma_cau_do'] ?? 0);
    $dap_an_gui = is_string($du_lieu['dap_an'] ?? null) ? $du_lieu['dap_an'] : '';
    $ma_luu = isset($du_lieu['ma_luu']) ? (int) $du_lieu['ma_luu'] : 0;

    if ($ma_cau_do <= 0) {
        tra_loi_loi('Thieu ma_cau_do.');
    }
    if (trim($dap_an_gui) === '') {
        tra_loi_loi('Thieu dap_an.');
    }

    $tim = $pdo->prepare('SELECT dap_an, ma_vat_pham_can, ma_vat_pham_thuong FROM CAU_DO WHERE ma_cau_do = ?');
    $tim->execute([$ma_cau_do]);
    $cau_do = $tim->fetch();
    if ($cau_do === false) {
        tra_loi_loi('Cau do khong ton tai.', 404);
    }
    if ($cau_do['dap_an'] === null || $cau_do['dap_an'] === '') {
        tra_loi_loi('Cau do nay chua co dap an.', 409);
    }

    if ($cau_do['ma_vat_pham_can'] !== null) {
        $kiem_do = $pdo->prepare('SELECT 1 FROM TUI_DO WHERE ma_nguoi_choi = ? AND ma_vat_pham = ?');
        $kiem_do->execute([$ma_nguoi_choi, (int) $cau_do['ma_vat_pham_can']]);
        if ($kiem_do->fetch() === false) {
            tra_loi_loi('Can vat pham de giai cau do nay.', 403);
        }
    }

    if (bo_dau($dap_an_gui) !== bo_dau($cau_do['dap_an'])) {
        tra_loi(['ma_cau_do' => $ma_cau_do, 'correct' => false, 'da_hoan_thanh' => false, 'vat_pham_thuong' => null]);
    }

    if ($ma_luu > 0) {
        $kiem_luu = $pdo->prepare('SELECT 1 FROM LUU_GAME WHERE ma_luu = ? AND ma_nguoi_choi = ?');
        $kiem_luu->execute([$ma_luu, $ma_nguoi_choi]);
        if ($kiem_luu->fetch() === false) {
            tra_loi_loi('Ban luu khong ton tai hoac khong phai cua ban.', 404);
        }
    }

    $vat_pham_thuong = null;
    $pdo->beginTransaction();
    try {
        if ($ma_luu > 0) {
            $ghi = $pdo->prepare(
                'INSERT INTO TIEN_DO_CAU_DO (ma_luu, ma_cau_do, da_hoan_thanh, ngay_giai) VALUES (?, ?, 1, NOW())' .
                ' ON DUPLICATE KEY UPDATE da_hoan_thanh = 1, ngay_giai = NOW()'
            );
            $ghi->execute([$ma_luu, $ma_cau_do]);
        }
        if ($cau_do['ma_vat_pham_thuong'] !== null) {
            // INSERT IGNORE: giai lai cau do khong nhan thuong them lan nua.
            $thuong = $pdo->prepare('INSERT IGNORE INTO TUI_DO (ma_nguoi_choi, ma_vat_pham, so_luong) VALUES (?, ?, 1)');
            $thuong->execute([$ma_nguoi_choi, (int) $cau_do['ma_vat_pham_thuong']]);
            $lay_thuong = $pdo->prepare('SELECT ma_vat_pham, ten_vat_pham, mo_ta FROM VAT_PHAM WHERE ma_vat_pham = ?');
            $lay_thuong->execute([(int) $cau_do['ma_vat_pham_thuong']]);
            $vat_pham_thuong = $lay_thuong->fetch() ?: null;
        }
        $pdo->commit();
    } catch (Exception $loi) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $loi;
    }

    tra_loi(['ma_cau_do' => $ma_cau_do, 'correct' => true, 'da_hoan_thanh' => true, 'vat_pham_thuong' => $vat_pham_thuong]);
}

// Khong co action nao khop thi tra loi 404.
tra_loi_loi('Action khong ton tai. Xem README de biet danh sach endpoint.', 404);
