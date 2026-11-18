/* leaderboard.js: bảng xếp hạng theo từng chương có chế độ live.
   GET <API_BASE>/index.php?action=leaderboard&ma_chuong=<số>
   Mọi lời gọi API đi qua api.js (window.QD). Tự tải lại mỗi 10 giây và hiện giờ cập nhật. */
(function () {
  "use strict";

  var LIVE_INTERVAL_MS = 10000;
  var CHAPTERS = [
    { ma: 1, ten: "Chương 1: Dinh thự bị lãng quên" },
    { ma: 2, ten: "Chương 2: Thư viện bí mật" },
    { ma: 3, ten: "Chương 3: Kho báu bị chôn giấu" },
    { ma: 4, ten: "Chương 4: Chuyến tàu đêm" },
    { ma: 5, ten: "Chương 5: Cuộn chỉ đỏ" },
    { ma: 6, ten: "Chương 6: Kho số 9" }
  ];

  var currentChapter = 1;
  var refreshTimer = null;
  var requestSeq = 0;
  var lastUpdatedText = "";

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function fmtClock(date) {
    return pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds());
  }

  function fmtTime(value) {
    if (value === null || value === undefined || value === "") return "-";
    var s = parseInt(value, 10);
    if (isNaN(s) || s < 0) return String(value);
    return Math.floor(s / 60) + ":" + pad2(s % 60);
  }

  function fmtDate(value) {
    if (!value) return "-";
    var d = new Date(String(value).replace(" ", "T"));
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function extractRows(res) {
    if (!res) return [];
    if (res.ok === false || res.success === false) {
      throw new Error(res.error || res.message || "Không tải được bảng xếp hạng.");
    }
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.rows)) return res.rows;
    if (Array.isArray(res.bang_xep_hang)) return res.bang_xep_hang;
    return [];
  }

  function setStatus(text) {
    var status = document.getElementById("lbStatus");
    if (!status) return;
    status.textContent = text;
    status.classList.remove("hidden");
  }

  function renderRows(rows) {
    var body = document.getElementById("lbBody");
    var empty = document.getElementById("lbEmpty");
    if (!body) return;
    body.innerHTML = "";
    if (!rows || rows.length === 0) {
      if (empty) empty.classList.remove("hidden");
      return;
    }
    if (empty) empty.classList.add("hidden");
    rows.forEach(function (row, i) {
      var tr = document.createElement("tr");
      var hang = row.hang !== undefined && row.hang !== null ? row.hang : (i + 1);
      var ten = row.ten_dang_nhap || row.ten || row.nguoi_choi || "Người chơi ẩn danh";
      var thoiGian = row.thoi_gian_hoan_thanh !== undefined ? row.thoi_gian_hoan_thanh : row.thoi_gian;
      var ngay = row.ngay_ghi_nhan || row.ngay_hoan_thanh || row.ngay_tao || row.created_at;
      var soGoiY = "-";
      if (row.so_goi_y_da_dung !== undefined && row.so_goi_y_da_dung !== null) {
        soGoiY = row.so_goi_y_da_dung;
      } else if (row.so_goi_y !== undefined && row.so_goi_y !== null) {
        soGoiY = row.so_goi_y;
      }
      tr.innerHTML =
        "<td>" + escapeHtml(String(hang)) + "</td>" +
        "<td>" + escapeHtml(ten) + "</td>" +
        "<td>" + fmtTime(thoiGian) + "</td>" +
        "<td>" + escapeHtml(String(soGoiY)) + "</td>" +
        "<td>" + escapeHtml(fmtDate(ngay)) + "</td>";
      body.appendChild(tr);
    });
  }

  function updateHeaderAndTabs(maChuong) {
    var title = document.getElementById("lbChapterTitle");
    var ch = CHAPTERS.filter(function (c) { return c.ma === maChuong; })[0];
    if (title && ch) title.textContent = ch.ten;
    document.querySelectorAll(".lb-tab").forEach(function (b) {
      var active = parseInt(b.getAttribute("data-chuong"), 10) === maChuong;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function loadChapter(maChuong, isLiveRefresh) {
    var seq = ++requestSeq;
    currentChapter = maChuong;
    updateHeaderAndTabs(maChuong);

    if (!isLiveRefresh) {
      setStatus("Đang tải bảng xếp hạng...");
    }

    if (!window.QD || typeof QD.getLeaderboard !== "function") {
      setStatus("Không tìm thấy mô-đun kết nối máy chủ (api.js).");
      renderRows([]);
      return;
    }

    QD.getLeaderboard(maChuong).then(function (data) {
      if (seq !== requestSeq) return;
      var rows = extractRows(data);
      lastUpdatedText = fmtClock(new Date());
      renderRows(rows);
      setStatus("Chế độ live (tự cập nhật mỗi 10 giây) | Cập nhật lúc " + lastUpdatedText);
    }).catch(function (err) {
      if (seq !== requestSeq) return;
      var reason = (err && err.message) ? err.message : "lỗi kết nối";
      if (isLiveRefresh && lastUpdatedText) {
        setStatus("Tạm mất kết nối (" + reason + ") | Lần cập nhật gần nhất lúc " + lastUpdatedText + ", sẽ thử lại sau 10 giây.");
        return;
      }
      setStatus("Chưa tải được bảng xếp hạng: " + reason + ". Hệ thống sẽ tự thử lại mỗi 10 giây.");
      renderRows([]);
    });
  }

  function restartLiveTimer() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    refreshTimer = setInterval(function () {
      if (document.hidden) return;
      loadChapter(currentChapter, true);
    }, LIVE_INTERVAL_MS);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".lb-tab").forEach(function (b) {
      b.addEventListener("click", function () {
        var nextChapter = parseInt(b.getAttribute("data-chuong"), 10);
        if (isNaN(nextChapter)) return;
        lastUpdatedText = "";
        loadChapter(nextChapter, false);
        restartLiveTimer();
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        loadChapter(currentChapter, true);
      }
    });

    window.addEventListener("beforeunload", function () {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    });

    loadChapter(1, false);
    restartLiveTimer();
  });
})();
