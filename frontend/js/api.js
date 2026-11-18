/* api.js: lớp gọi backend Quạ Đen (PHP + MySQL).
   Contract: /backend/api/index.php?action=<tên>
   - POST register, login, logout, pickup, solve, save, leaderboard
   - GET  chapters, chapter, inventory, load, leaderboard
   Xác thực bằng PHP session cookie (credentials: "include"). */
(function () {
  "use strict";

  var BASE = (window.QUA_DEN_API_BASE || "http://localhost:8000/backend/api").replace(/\/+$/, "");
  var LOGIN_FLAG_KEY = "qd_logged_in";
  var USER_KEY = "qd_user";

  function getToken() {
    try { return localStorage.getItem("qd_token") || ""; } catch (e) { return ""; }
  }
  function setSessionUser(username, token) {
    try {
      localStorage.setItem(LOGIN_FLAG_KEY, "1");
      if (username) localStorage.setItem(USER_KEY, username);
      if (token) localStorage.setItem("qd_token", token);
    } catch (e) { /* bỏ qua khi trình duyệt chặn localStorage */ }
  }
  function setToken(token, username) {
    setSessionUser(username, token);
  }
  function clearToken() {
    try {
      localStorage.removeItem(LOGIN_FLAG_KEY);
      localStorage.removeItem("qd_token");
      localStorage.removeItem(USER_KEY);
    } catch (e) { /* bỏ qua */ }
  }
  function getUser() {
    try { return localStorage.getItem(USER_KEY) || ""; } catch (e) { return ""; }
  }
  function isLoggedIn() {
    try {
      return localStorage.getItem(LOGIN_FLAG_KEY) === "1" || !!getToken();
    } catch (e) {
      return false;
    }
  }
  function unwrap(res) {
    if (!res) return null;
    return res.data !== undefined ? res.data : res;
  }

  function buildUrl(action, params) {
    var url = BASE + "/index.php?action=" + encodeURIComponent(action);
    if (params) {
      Object.keys(params).forEach(function (k) {
        url += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
      });
    }
    return url;
  }

  /* Gọi API. Trả về JSON đã parse. Nếu backend trả lời không phải JSON,
     ném lỗi có thông điệp để giao diện hiện cho người chơi. */
  function api(action, options) {
    options = options || {};
    var method = (options.method || "GET").toUpperCase();
    var url = buildUrl(action, options.params);
    var headers = { "Accept": "application/json" };
    var fetchOptions = { method: method, headers: headers, credentials: "include" };
    if (method !== "GET") {
      headers["Content-Type"] = "application/json";
      if (options.body !== undefined) fetchOptions.body = JSON.stringify(options.body);
    }
    return fetch(url, fetchOptions).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!res.ok || (data && data.ok === false)) {
          if (res.status === 401) {
            clearToken();
          }
          var msg = (data && (data.error || data.message)) || ("Lỗi " + res.status + " từ máy chủ.");
          var err = new Error(msg);
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      });
    }).catch(function (err) {
      if (err && err.name === "TypeError") {
        throw new Error("Không kết nối được máy chủ (" + BASE + "). Hãy chắc backend đang chạy.");
      }
      throw err;
    });
  }

  function register(tenDangNhap, email, matKhau) {
    return api("register", {
      method: "POST",
      body: { ten_dang_nhap: tenDangNhap, email: email, mat_khau: matKhau }
    });
  }
  function login(tenDangNhap, matKhau) {
    return api("login", {
      method: "POST",
      body: { ten_dang_nhap: tenDangNhap, mat_khau: matKhau }
    }).then(function (res) {
      var payload = unwrap(res) || {};
      var token = payload.token || payload.access_token || "";
      var user = (payload.nguoi_choi && payload.nguoi_choi.ten_dang_nhap) ||
                 payload.ten_dang_nhap || tenDangNhap;
      setSessionUser(user, token);
      return res;
    });
  }
  function logout() {
    clearToken();
    return api("logout", { method: "POST" }).catch(function () {
      return null;
    });
  }

  function saveGame(payload) {
    return api("save", { method: "POST", body: payload });
  }
  function loadGame(maChuong) {
    var params = maChuong ? { ma_chuong: maChuong } : undefined;
    return api("load", { params: params });
  }
  function getInventory() {
    return api("inventory", {});
  }
  function pickup(maVatPham) {
    return api("pickup", { method: "POST", body: { ma_vat_pham: maVatPham } });
  }
  function solve(maCauDo, dapAn, maLuu) {
    var body = { ma_cau_do: maCauDo, dap_an: dapAn };
    if (maLuu) body.ma_luu = maLuu;
    return api("solve", { method: "POST", body: body });
  }
  function getLeaderboard(maChuong) {
    return api("leaderboard", { params: { ma_chuong: maChuong } });
  }
  function getChapters() {
    return api("chapters", {});
  }
  function getChapter(maChuong) {
    return api("chapter", { params: { ma_chuong: maChuong || 1 } });
  }

  window.QD = {
    BASE: BASE,
    api: api,
    buildUrl: buildUrl,
    unwrap: unwrap,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    getUser: getUser,
    isLoggedIn: isLoggedIn,
    register: register,
    login: login,
    logout: logout,
    saveGame: saveGame,
    loadGame: loadGame,
    getInventory: getInventory,
    pickup: pickup,
    solve: solve,
    getLeaderboard: getLeaderboard,
    getChapters: getChapters,
    getChapter: getChapter
  };
})();
