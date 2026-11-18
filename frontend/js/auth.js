/* auth.js: form Đăng ký / Đăng nhập + trạng thái tài khoản trên thanh điều hướng.
   Dùng chung cho index.html, auth.html, leaderboard.html, game.html.
   Mọi lời gọi API đi qua api.js (window.QD). Không sửa cấu trúc DOM của HTML. */
(function () {
  "use strict";

  var LOGIN_FLAG_KEY = "qd_logged_in";
  var USER_KEY = "qd_user";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Chuyển các thông báo không dấu từ backend sang tiếng Việt có dấu rõ ràng. */
  var ERROR_MAP = {
    "ten dang nhap hoac mat khau sai.": "Tên đăng nhập hoặc mật khẩu không đúng.",
    "ten dang nhap hoac mat khau khong dung": "Tên đăng nhập hoặc mật khẩu không đúng.",
    "thieu ten dang nhap hoac mat khau.": "Hãy nhập đầy đủ tên đăng nhập và mật khẩu.",
    "ten dang nhap dai tu 3 den 50 ky tu.": "Tên đăng nhập phải dài từ 3 đến 50 ký tự.",
    "mat khau it nhat 6 ky tu.": "Mật khẩu cần ít nhất 6 ký tự.",
    "email khong dung dinh dang.": "Email không đúng định dạng.",
    "ten dang nhap da co nguoi dung.": "Tên đăng nhập đã tồn tại. Hãy chọn tên khác.",
    "ten dang nhap da ton tai": "Tên đăng nhập đã tồn tại. Hãy chọn tên khác.",
    "email da co nguoi dung.": "Email đã được sử dụng. Hãy dùng email khác.",
    "chua dang nhap.": "Bạn chưa đăng nhập.",
    "chua dang nhap": "Bạn chưa đăng nhập."
  };

  function $(id) { return document.getElementById(id); }

  function formatErrorMessage(raw, fallback) {
    if (!raw) return fallback;
    var text = String(raw).trim();
    var mapped = ERROR_MAP[text.toLowerCase()];
    return mapped || text;
  }

  function showMsg(el, text, isError) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove("hidden");
    el.classList.toggle("msg-error", !!isError);
    el.classList.toggle("msg-ok", !isError);
  }

  function isLoggedInState() {
    if (window.QD && typeof QD.isLoggedIn === "function" && QD.isLoggedIn()) {
      return true;
    }
    try {
      return localStorage.getItem(LOGIN_FLAG_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function getDisplayUser() {
    var user = (window.QD && typeof QD.getUser === "function") ? QD.getUser() : "";
    if (user) return user;
    try {
      return localStorage.getItem(USER_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function markLoggedInUI(username) {
    try {
      localStorage.setItem(LOGIN_FLAG_KEY, "1");
      if (username) localStorage.setItem(USER_KEY, username);
    } catch (e) { /* bỏ qua khi trình duyệt chặn localStorage */ }
  }

  function clearLoggedInUI() {
    try {
      localStorage.removeItem(LOGIN_FLAG_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) { /* bỏ qua */ }
  }

  function unwrapPayload(res) {
    if (!res) return {};
    if (res.data && typeof res.data === "object") return res.data;
    return res;
  }

  function assertApiOk(res, fallbackMsg) {
    if (res && (res.ok === false || res.success === false)) {
      throw new Error(res.error || res.message || fallbackMsg);
    }
    return res;
  }

  function extractUsername(res, fallbackName) {
    var payload = unwrapPayload(res);
    return (payload && payload.ten_dang_nhap) ||
           (payload && payload.nguoi_choi && payload.nguoi_choi.ten_dang_nhap) ||
           (res && res.ten_dang_nhap) ||
           fallbackName || "";
  }

  /* Cập nhật thanh điều hướng theo trạng thái đăng nhập.
     Các phần tử có id cố định từ HTML của Ân: navLogin, navRegister, navUser, navLogout. */
  function updateAuthUI() {
    var loggedIn = isLoggedInState();
    var user = loggedIn ? getDisplayUser() : "";
    ["navLogin", "navRegister"].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.toggle("hidden", loggedIn);
    });
    var userEl = $("navUser");
    if (userEl) {
      userEl.classList.toggle("hidden", !loggedIn);
      userEl.textContent = loggedIn ? ("Xin chào, " + (user || "Người chơi")) : "";
    }
    var logoutEl = $("navLogout");
    if (logoutEl) logoutEl.classList.toggle("hidden", !loggedIn);
  }

  function bindLogout() {
    var btn = $("navLogout");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var logoutResult = (window.QD && typeof QD.logout === "function") ? QD.logout() : null;
      Promise.resolve(logoutResult).catch(function () {
        return null;
      }).then(function () {
        clearLoggedInUI();
        updateAuthUI();
        if (window.location.pathname.indexOf("game.html") >= 0) {
          window.location.href = "index.html";
        }
      });
    });
  }

  function bindLoginForm() {
    var form = $("loginForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = $("loginName");
      var passInput = $("loginPass");
      var msg = $("loginMsg");
      var btn = form.querySelector("button[type=submit]");
      if (!nameInput || !passInput || !btn || btn.disabled) return;

      var name = nameInput.value.trim();
      var pass = passInput.value;

      if (!name || !pass) {
        showMsg(msg, "Hãy nhập đầy đủ tên đăng nhập và mật khẩu.", true);
        return;
      }
      if (!window.QD || typeof QD.login !== "function") {
        showMsg(msg, "Không tìm thấy mô-đun kết nối máy chủ (api.js).", true);
        return;
      }

      btn.disabled = true;
      btn.textContent = "Đang đăng nhập...";

      QD.login(name, pass).then(function (res) {
        assertApiOk(res, "Tên đăng nhập hoặc mật khẩu không đúng.");
        var user = extractUsername(res, name);
        markLoggedInUI(user);
        updateAuthUI();
        showMsg(msg, "Đăng nhập thành công. Đang chuyển vào game...", false);
        setTimeout(function () { window.location.href = "game.html"; }, 600);
      }).catch(function (err) {
        showMsg(
          msg,
          formatErrorMessage(err && err.message, "Đăng nhập thất bại. Kiểm tra lại tên đăng nhập và mật khẩu."),
          true
        );
        btn.disabled = false;
        btn.textContent = "Đăng nhập";
      });
    });
  }

  function bindRegisterForm() {
    var form = $("registerForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = $("regName");
      var emailInput = $("regEmail");
      var passInput = $("regPass");
      var pass2Input = $("regPass2");
      var msg = $("regMsg");
      var btn = form.querySelector("button[type=submit]");
      if (!nameInput || !emailInput || !passInput || !pass2Input || !btn || btn.disabled) return;

      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var pass = passInput.value;
      var pass2 = pass2Input.value;

      if (!name || !email || !pass || !pass2) {
        showMsg(msg, "Hãy nhập đầy đủ tên đăng nhập, email và mật khẩu.", true);
        return;
      }
      if (name.length < 3 || name.length > 50) {
        showMsg(msg, "Tên đăng nhập phải dài từ 3 đến 50 ký tự.", true);
        return;
      }
      if (!EMAIL_RE.test(email)) {
        showMsg(msg, "Email không đúng định dạng.", true);
        return;
      }
      if (pass.length < 6) {
        showMsg(msg, "Mật khẩu cần ít nhất 6 ký tự.", true);
        return;
      }
      if (pass !== pass2) {
        showMsg(msg, "Hai lần nhập mật khẩu không khớp.", true);
        return;
      }
      if (!window.QD || typeof QD.register !== "function" || typeof QD.login !== "function") {
        showMsg(msg, "Không tìm thấy mô-đun kết nối máy chủ (api.js).", true);
        return;
      }

      btn.disabled = true;
      btn.textContent = "Đang tạo tài khoản...";

      QD.register(name, email, pass).then(function (res) {
        assertApiOk(res, "Tạo tài khoản thất bại.");
        btn.textContent = "Đang đăng nhập...";
        return QD.login(name, pass).then(function (loginRes) {
          assertApiOk(loginRes, "Đăng nhập tự động thất bại.");
          var user = extractUsername(loginRes, name);
          markLoggedInUI(user);
          updateAuthUI();
          showMsg(msg, "Tạo tài khoản thành công. Đang chuyển vào game...", false);
          setTimeout(function () { window.location.href = "game.html"; }, 600);
        }).catch(function () {
          showMsg(msg, "Tạo tài khoản thành công, nhưng chưa tự đăng nhập được. Hãy đăng nhập ở khung bên trên.", false);
          if ($("loginName")) $("loginName").value = name;
          btn.disabled = false;
          btn.textContent = "Tạo tài khoản";
        });
      }).catch(function (err) {
        showMsg(
          msg,
          formatErrorMessage(err && err.message, "Tạo tài khoản thất bại. Tên đăng nhập hoặc email có thể đã tồn tại."),
          true
        );
        btn.disabled = false;
        btn.textContent = "Tạo tài khoản";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateAuthUI();
    bindLogout();
    bindLoginForm();
    bindRegisterForm();
  });

  window.addEventListener("storage", function (e) {
    if (!e || e.key === LOGIN_FLAG_KEY || e.key === USER_KEY || e.key === null) {
      updateAuthUI();
    }
  });
})();
