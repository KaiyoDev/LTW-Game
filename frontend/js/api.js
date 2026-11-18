/* api.js: lớp gọi backend Quạ Đen (PHP + MySQL).
   Contract: /api/index.php?action=<tên>
   - POST register, login, save
   - GET  load, inventory, leaderboard, chapters
   Token lưu ở localStorage khóa "qd_token", tên người chơi ở "qd_user". */
(function () {
  "use strict";

  var BASE = (window.QUA_DEN_API_BASE || "http://localhost:8000/api").replace(/\/+$/, "");

  function getToken() {
    try { return localStorage.getItem("qd_token") || ""; } catch (e) { return ""; }
  }
  function setToken(token, username) {
    try {
      if (token) localStorage.setItem("qd_token", token);
      if (username) localStorage.setItem("qd_user", username);
    } catch (e) { /* bỏ qua khi trình duyệt chặn localStorage */ }
  }
  function clearToken() {
    try {
      localStorage.removeItem("qd_token");
      localStorage.removeItem("qd_user");
    } catch (e) { /* bỏ qua */ }
  }
  function getUser() {
    try { return localStorage.getItem("qd_user") || ""; } catch (e) { return ""; }
  }
  function isLoggedIn() { return !!getToken(); }

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
    if (options.auth !== false && getToken()) {
      headers["Authorization"] = "Bearer " + getToken();
    }
    return fetch(url, fetchOptions).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!res.ok) {
          var msg = (data && (data.message || data.error)) || ("Lỗi " + res.status + " từ máy chủ.");
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
      auth: false,
      body: { ten_dang_nhap: tenDangNhap, email: email, mat_khau: matKhau }
    });
  }
  function login(tenDangNhap, matKhau) {
    return api("login", {
      method: "POST",
      auth: false,
      body: { ten_dang_nhap: tenDangNhap, mat_khau: matKhau }
    }).then(function (data) {
      var token = (data && (data.token || data.access_token)) || "";
      var user = (data && data.nguoi_choi && data.nguoi_choi.ten_dang_nhap) ||
                 (data && data.ten_dang_nhap) || tenDangNhap;
      if (token) setToken(token, user);
      return data;
    });
  }
  function logout() { clearToken(); }

  function saveGame(payload) {
    return api("save", { method: "POST", body: payload });
  }
  function loadGame(maChuong) {
    return api("load", { params: { ma_chuong: maChuong } });
  }
  // Giữ nguyên envelope để nơi gọi đọc response.data. Không coi lỗi API là túi trống.
  function inventoryResponse(response) {
    if (!response || (response.ok !== true && response.success !== true) ||
        response.ok === false || response.success === false) {
      throw new Error((response && (response.error || response.message)) || "Phản hồi vật phẩm không hợp lệ.");
    }
    return response;
  }
  function getInventory() {
    return api("inventory", { auth: false }).then(inventoryResponse).then(function (response) {
      if (!Array.isArray(response.data)) throw new Error("Dữ liệu túi đồ không hợp lệ.");
      return response;
    });
  }
  // maVatPham lấy từ dữ liệu server, không dùng tên/mã nội bộ của bản demo.
  function pickupItem(maVatPham) {
    if (!Number.isSafeInteger(maVatPham) || maVatPham <= 0) {
      return Promise.reject(new Error("Mã vật phẩm không hợp lệ."));
    }
    return api("pickup", {
      method: "POST",
      auth: false,
      body: { ma_vat_pham: maVatPham }
    }).then(inventoryResponse);
  }
  function getLeaderboard(maChuong) {
    return api("leaderboard", { auth: false, params: { ma_chuong: maChuong } });
  }
  function getChapters() {
    return api("chapters", { auth: false });
  }

  window.QD = {
    BASE: BASE,
    api: api,
    buildUrl: buildUrl,
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
    pickupItem: pickupItem,
    getLeaderboard: getLeaderboard,
    getChapters: getChapters
  };
})();
