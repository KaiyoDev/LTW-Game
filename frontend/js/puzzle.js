/* puzzle.js: logic giải đố và quản lý gợi ý cho game Quạ Đen.
   Phụ trách bởi: Nghi (Câu đố, manh mối, gợi ý).
   Tuân theo quy ước:
   - Gợi ý lấy trực tiếp từ bảng MANH_MOI qua API action=chapter.
   - Giải đố qua API action=solve, đối chiếu đáp án ở server.
   - Đáp án có dấu và không dấu đều được chấp nhận nhờ chuẩn hóa ở server.
   - Tuyệt đối không để lộ cột dap_an ra giao diện hoặc API.
   - Cần api.js (window.QD) được nạp trước. */
(function () {
  "use strict";

  // Bộ nhớ tạm lưu trữ manh mối lấy từ bảng MANH_MOI qua API.
  var manhMoiCache = {};
  var hintsLoaded = false;
  var solvedCache = {};

  // Manh mối dự phòng cho Chương 1 nếu mạng chưa kết nối được tới backend.
  // Đồng bộ hoàn toàn với bảng MANH_MOI trong backend/db/seed.sql.
  var MANH_MOI_FALLBACK = {
    1: "Rãnh chữ L chỉ có một đường đi duy nhất, kéo chốt men theo rãnh.",
    2: "Hộp thiếc nằm sâu dưới gầm giường, cần thứ gì dài và cong như chiếc móc áo để kéo ra.",
    3: "Mặt sau bức ảnh gia đình có chữ viết tay, phải soi đèn mới đọc rõ.",
    4: "Xoay chậu cây theo vết xước trên thành chậu, bên dưới sẽ thấy chìa đồng.",
    5: "Nghe kỹ cuộn băng để phân biệt tiếng mưa và tiếng chuông chùa.",
    6: "Tờ giấy giấu trong tủ áo gỗ được gấp lại theo nếp cũ, mở đúng nếp sẽ thấy nội dung.",
    7: "Dùng gương cầm tay hứng ánh nắng mặt trời để chiếu sáng khe tối dưới bồn nước.",
    8: "Khi người lạ ngoài cửa hỏi, hãy nói dối người lạ qua để lấy trang sổ số 1."
  };

  // Thông tin hiển thị 8 câu đố Chương 1 (không chứa đáp án).
  var PUZZLES_INFO = {
    1: {
      ten: "Chốt cửa gài theo rãnh chữ L",
      moTa: "Chốt cửa gài theo rãnh chữ L, kéo chốt men theo rãnh mới mở được cửa.",
      maPhong: 1
    },
    2: {
      ten: "Hộp thiếc dưới gầm giường và chiếc móc áo uốn cong",
      moTa: "Hộp thiếc nằm sâu dưới gầm giường, tay không với tới.",
      maPhong: 1,
      vatPhamCan: 9
    },
    3: {
      ten: "Bức ảnh gia đình soi đèn mới đọc được",
      moTa: "Bức ảnh gia đình cũ treo ở hành lang, mặt sau có chữ viết tay, phải soi đèn mới đọc được.",
      maPhong: 2
    },
    4: {
      ten: "Chậu cây giấy xoay theo vết xước",
      moTa: "Chậu cây giấy xoay được theo vết xước trên thành chậu.",
      maPhong: 3,
      vatPhamThuong: 1
    },
    5: {
      ten: "Cuộn băng ghi tiếng mưa và tiếng chuông",
      moTa: "Cuộn băng cát-xét ghi lại tiếng mưa trên mái tôn và tiếng chuông chùa lúc nửa đêm.",
      maPhong: 1
    },
    6: {
      ten: "Tủ áo và tờ giấy gấp theo nếp cũ",
      moTa: "Trong tủ áo gỗ có tờ giấy cũ gấp theo nếp, mở theo đúng nếp để đọc điều chú Bảo ghi.",
      maPhong: 1
    },
    7: {
      ten: "Gương cầm tay hứng nắng vào khe tối dưới bồn nước",
      moTa: "Dùng gương cầm tay ở sân thượng, hứng ánh nắng chiếu sáng khe tối dưới bồn nước.",
      maPhong: 3,
      vatPhamCan: 10
    },
    8: {
      ten: "Nơi đợi người lạ qua cửa phòng",
      moTa: "Nơi đợi người lạ qua cửa phòng.",
      maPhong: 1,
      vatPhamThuong: 2
    }
  };

  /* Nạp toàn bộ manh mối của 1 chương từ server qua action=chapter.
     Đồng thời kiểm tra an toàn: response không được chứa trường dap_an. */
  function fetchHints(maChuong) {
    if (!window.QD || typeof QD.getChapter !== "function") {
      return Promise.resolve(MANH_MOI_FALLBACK);
    }
    return QD.getChapter(maChuong || 1).then(function (res) {
      var data = QD.unwrap(res) || {};
      var phongList = data.phong || [];
      var hasDapAn = false;

      phongList.forEach(function (phong) {
        (phong.cau_do || []).forEach(function (cd) {
          // Kiểm tra an toàn: nếu phát hiện lộ dap_an thì cảnh báo
          if (cd.dap_an !== undefined) {
            hasDapAn = true;
          }
          if (cd.manh_moi && Array.isArray(cd.manh_moi)) {
            var noiDungList = cd.manh_moi.map(function (m) { return m.noi_dung; }).filter(Boolean);
            if (noiDungList.length > 0) {
              manhMoiCache[cd.ma_cau_do] = noiDungList.join(" ");
            }
          }
        });
      });

      if (hasDapAn) {
        console.error("CẢNH BÁO BẢO MẬT: Phát hiện trường dap_an trong response API chapter!");
      }

      hintsLoaded = true;
      return manhMoiCache;
    }).catch(function (err) {
      console.warn("Chưa tải được manh mối từ server, sử dụng manh mối cục bộ:", err.message);
      return MANH_MOI_FALLBACK;
    });
  }

  /* Lấy gợi ý cho 1 câu đố cụ thể từ bảng MANH_MOI (ưu tiên cache server, fallback DB). */
  function getHintForPuzzle(maCauDo) {
    if (manhMoiCache[maCauDo]) {
      return manhMoiCache[maCauDo];
    }
    if (MANH_MOI_FALLBACK[maCauDo]) {
      return MANH_MOI_FALLBACK[maCauDo];
    }
    return "Hãy quan sát kỹ đồ vật xung quanh căn phòng để tìm thêm manh mối.";
  }

  /* Xác định gợi ý phù hợp nhất dựa trên tiến trình chơi hiện tại. */
  function getCurrentHint(state) {
    state = state || {};
    var solved = state.solvedIds || Object.keys(solvedCache).map(Number);
    var hasItem = state.hasItem || function () { return false; };

    // Chưa lấy móc áo
    if (!hasItem("hook") && solved.indexOf(2) < 0) {
      return "Trong phòng trọ có một tủ áo gỗ. Mở nó ra xem có gì dùng được.";
    }
    // Câu 2: Hộp thiếc dưới gầm giường
    if (solved.indexOf(2) < 0) {
      return getHintForPuzzle(2);
    }
    // Câu 6: Tờ giấy gấp theo nếp cũ
    if (solved.indexOf(6) < 0) {
      return getHintForPuzzle(6);
    }
    // Câu 3: Bức ảnh gia đình
    if (solved.indexOf(3) < 0) {
      return getHintForPuzzle(3);
    }
    // Câu 7: Gương cầm tay
    if (solved.indexOf(7) < 0) {
      return getHintForPuzzle(7);
    }
    // Câu 4: Chậu cây giấy
    if (solved.indexOf(4) < 0) {
      return getHintForPuzzle(4);
    }
    // Câu 5: Cuộn băng
    if (solved.indexOf(5) < 0) {
      return getHintForPuzzle(5);
    }
    // Câu 1: Chốt cửa
    if (solved.indexOf(1) < 0) {
      return getHintForPuzzle(1);
    }
    // Câu 8: Câu đố cuối trước cửa phòng
    if (solved.indexOf(8) < 0) {
      return getHintForPuzzle(8);
    }
    return "Cửa đã mở, Trang sổ số 1 đã nằm trong tay bạn. Chạm vào cửa chính để rời khỏi đây.";
  }

  /* Giải một câu đố qua API solve.
     Server tự chuẩn hóa tiếng Việt (có dấu và không dấu đều hợp lệ).
     Server kiểm tra vật phẩm cần và trả về vật phẩm thưởng nếu có. */
  function solvePuzzle(maCauDo, dapAn, maLuu) {
    if (!window.QD || typeof QD.solve !== "function") {
      return Promise.reject(new Error("Lớp gọi API (QD.solve) chưa sẵn sàng."));
    }
    if (typeof QD.isLoggedIn === "function" && !QD.isLoggedIn()) {
      return Promise.reject(new Error("Chưa đăng nhập. Hãy đăng nhập để giải câu đố và lưu tiến trình."));
    }
    if (!dapAn || !String(dapAn).trim()) {
      return Promise.reject(new Error("Đáp án không được để trống."));
    }
    return QD.solve(maCauDo, dapAn, maLuu).then(function (res) {
      var data = QD.unwrap(res) || {};
      if (data.correct) {
        solvedCache[maCauDo] = true;
      }
      return {
        correct: !!data.correct,
        maCauDo: data.ma_cau_do || maCauDo,
        lyDo: data.ly_do || null,
        thuong: data.thuong || null
      };
    });
  }

  /* Kiểm tra response của action=chapter để bảo đảm không lộ cột dap_an.
     Trả về true nếu sạch sẽ (an toàn), false nếu bị lộ. */
  function checkNoAnswerLeak(chapterData) {
    if (!chapterData) return true;
    var safe = true;
    var phongs = chapterData.phong || [];
    phongs.forEach(function (p) {
      (p.cau_do || []).forEach(function (c) {
        if (c.dap_an !== undefined) {
          safe = false;
        }
      });
    });
    return safe;
  }

  /* Tự động tăng cường giao diện game (game.html):
     - Đồng bộ nội dung hộp thoại Gợi ý từ bảng MANH_MOI.
     - Cho phép tương tác giải đố cho các câu 1.3, 1.5, 1.6, 1.7. */
  function enhanceGameUI() {
    var modalCard = document.getElementById("modalCard");
    var modal = document.getElementById("modal");
    if (!modalCard) return;

    function closeModal() {
      if (modal) modal.classList.remove("open");
      modalCard.innerHTML = "";
    }
    function bindClose() {
      modalCard.querySelectorAll("[data-close]").forEach(function (b) {
        b.onclick = closeModal;
      });
    }

    // Quan sát nội dung modal để tăng cường các câu đố
    var observer = new MutationObserver(function () {
      var h2 = modalCard.querySelector("h2");
      if (!h2) return;
      var title = h2.textContent.trim();

      // 1. Tự động đồng bộ nội dung Gợi ý từ bảng MANH_MOI
      if (title === "Gợi ý") {
        var p = modalCard.querySelector("p");
        if (p && !p.hasAttribute("data-manh-moi-synced")) {
          p.setAttribute("data-manh-moi-synced", "1");
          var currentHintText = getCurrentHint();
          if (currentHintText) {
            p.textContent = currentHintText;
          }
        }
        return;
      }

      // 2. Câu 1.3: Bức ảnh gia đình ở hành lang
      if (title === "Bức ảnh gia đình" && !modalCard.querySelector("#btnSolvePhoto")) {
        var btnPhoto = document.createElement("button");
        btnPhoto.className = "btn";
        btnPhoto.id = "btnSolvePhoto";
        btnPhoto.type = "button";
        btnPhoto.style.marginTop = "10px";
        btnPhoto.textContent = "Soi đèn vào mặt sau bức ảnh";
        btnPhoto.onclick = function () {
          btnPhoto.disabled = true;
          btnPhoto.textContent = "Đang kiểm tra...";
          solvePuzzle(3, "soi đèn").then(function (res) {
            if (res.correct) {
              btnPhoto.textContent = "Đã giải xong câu đố!";
              btnPhoto.style.background = "#31544d";
              var pInfo = document.createElement("p");
              pInfo.className = "sub";
              pInfo.style.color = "#7fb3a5";
              pInfo.textContent = "Dòng chữ viết tay hiện ra: 'Mọi manh mối đều hướng về sân thượng.'";
              modalCard.appendChild(pInfo);
            } else {
              btnPhoto.disabled = false;
              btnPhoto.textContent = "Soi đèn vào mặt sau bức ảnh";
            }
          }).catch(function (err) {
            alert(err.message || "Lỗi kiểm tra.");
            btnPhoto.disabled = false;
            btnPhoto.textContent = "Soi đèn vào mặt sau bức ảnh";
          });
        };
        modalCard.appendChild(btnPhoto);
        bindClose();
        return;
      }

      // 3. Câu 1.6: Tờ giấy gấp theo nếp cũ trong tủ áo
      if (title === "Tủ áo gỗ" && !modalCard.querySelector("#btnSolvePaper")) {
        var btnPaper = document.createElement("button");
        btnPaper.className = "btn";
        btnPaper.id = "btnSolvePaper";
        btnPaper.type = "button";
        btnPaper.style.marginTop = "10px";
        btnPaper.textContent = "Mở tờ giấy theo nếp cũ";
        btnPaper.onclick = function () {
          btnPaper.disabled = true;
          btnPaper.textContent = "Đang mở theo nếp...";
          solvePuzzle(6, "gấp theo nếp cũ").then(function (res) {
            if (res.correct) {
              btnPaper.textContent = "Đã mở tờ giấy thành công!";
              btnPaper.style.background = "#31544d";
              var pPaper = document.createElement("p");
              pPaper.className = "sub";
              pPaper.style.color = "#7fb3a5";
              pPaper.textContent = "Tờ giấy ghi: 'Trang sổ số 1 được giấu trước cửa phòng trọ.'";
              modalCard.appendChild(pPaper);
            } else {
              btnPaper.disabled = false;
              btnPaper.textContent = "Mở tờ giấy theo nếp cũ";
            }
          }).catch(function (err) {
            alert(err.message || "Lỗi kiểm tra.");
            btnPaper.disabled = false;
            btnPaper.textContent = "Mở tờ giấy theo nếp cũ";
          });
        };
        modalCard.appendChild(btnPaper);
        bindClose();
        return;
      }

      // 4. Câu 1.7: Gương cầm tay hứng nắng
      if (title === "Gương cầm tay" && !modalCard.querySelector("#btnSolveMirror")) {
        var btnMirror = document.createElement("button");
        btnMirror.className = "btn";
        btnMirror.id = "btnSolveMirror";
        btnMirror.type = "button";
        btnMirror.style.marginTop = "10px";
        btnMirror.textContent = "Hứng nắng vào khe tối dưới bồn nước";
        btnMirror.onclick = function () {
          btnMirror.disabled = true;
          btnMirror.textContent = "Đang hứng nắng...";
          solvePuzzle(7, "hứng nắng vào khe tối").then(function (res) {
            if (res.correct) {
              btnMirror.textContent = "Đã rọi sáng khe tối!";
              btnMirror.style.background = "#31544d";
              var pMirror = document.createElement("p");
              pMirror.className = "sub";
              pMirror.style.color = "#7fb3a5";
              pMirror.textContent = "Vệt sáng rọi vào khe tối, để lộ manh mối ẩn dưới bồn nước.";
              modalCard.appendChild(pMirror);
            } else {
              if (res.lyDo === "thieu_vat_pham") {
                alert("Bạn cần nhặt gương cầm tay trước khi thực hiện thao tác này!");
              } else {
                alert("Chưa đúng cách!");
              }
              btnMirror.disabled = false;
              btnMirror.textContent = "Hứng nắng vào khe tối dưới bồn nước";
            }
          }).catch(function (err) {
            alert(err.message || "Lỗi kiểm tra.");
            btnMirror.disabled = false;
            btnMirror.textContent = "Hứng nắng vào khe tối dưới bồn nước";
          });
        };
        modalCard.appendChild(btnMirror);
        bindClose();
        return;
      }
    });

    observer.observe(modalCard, { childList: true, subtree: true });

    // 5. Câu 1.5: Gắn xử lý giải đố cho đài radio
    var radioHotspot = document.querySelector('.hotspot[data-act="radio"]');
    if (radioHotspot) {
      radioHotspot.addEventListener("click", function (e) {
        e.stopPropagation();
        var html = '<button class="close-x" type="button" data-close>✕</button>' +
          "<h2>Cuộn băng cát-xét</h2>" +
          "<p>Chiếc đài radio cũ đang phát một cuộn băng ghi âm lúc nửa đêm: ngoài tiếng mưa rơi trên mái tôn, bạn nghe thấy một âm thanh điểm giờ quen thuộc.</p>" +
          '<p class="sub">Gõ âm thanh bạn nghe được trong cuộn băng (gợi ý: tiếng mưa và tiếng...):</p>' +
          '<input class="riddle-input" id="qdTapeInput" type="text" placeholder="Gõ âm thanh..." autocomplete="off" />' +
          '<p class="sub" id="qdTapeMsg"></p>' +
          '<button class="btn" type="button" id="btnSolveTape" style="margin-top:10px;">Nghe và trả lời</button>';
        modalCard.innerHTML = html;
        if (modal) modal.classList.add("open");
        bindClose();

        var tapeInput = document.getElementById("qdTapeInput");
        var tapeMsg = document.getElementById("qdTapeMsg");
        var btnTape = document.getElementById("btnSolveTape");

        if (btnTape && tapeInput) {
          tapeInput.focus();
          btnTape.onclick = function () {
            var val = tapeInput.value.trim();
            if (!val) {
              if (tapeMsg) tapeMsg.textContent = "Hãy gõ âm thanh bạn nghe thấy.";
              return;
            }
            btnTape.disabled = true;
            btnTape.textContent = "Đang kiểm tra...";
            solvePuzzle(5, val).then(function (res) {
              if (res.correct) {
                if (tapeMsg) {
                  tapeMsg.style.color = "#7fb3a5";
                  tapeMsg.textContent = "Chính xác! Cuộn băng ghi lại tiếng mưa và tiếng chuông chùa lúc nửa đêm.";
                }
                btnTape.textContent = "Đã giải xong câu đố!";
                btnTape.style.background = "#31544d";
              } else {
                if (tapeMsg) {
                  tapeMsg.style.color = "#c96f4a";
                  tapeMsg.textContent = "Chưa đúng âm thanh, hãy lắng nghe kỹ lại.";
                }
                btnTape.disabled = false;
                btnTape.textContent = "Nghe và trả lời";
              }
            }).catch(function (err) {
              if (tapeMsg) tapeMsg.textContent = err.message || "Lỗi kiểm tra.";
              btnTape.disabled = false;
              btnTape.textContent = "Nghe và trả lời";
            });
          };
        }
      }, true);
    }
  }

  /* Khởi tạo tự động khi trang đã sẵn sàng */
  document.addEventListener("DOMContentLoaded", function () {
    fetchHints(1).catch(function () {});
    enhanceGameUI();
  });

  // Xuất module ra phạm vi toàn cục
  window.QD_PUZZLE = {
    fetchHints: fetchHints,
    getHintForPuzzle: getHintForPuzzle,
    getCurrentHint: getCurrentHint,
    solvePuzzle: solvePuzzle,
    checkNoAnswerLeak: checkNoAnswerLeak,
    puzzlesInfo: PUZZLES_INFO,
    manhMoiCache: manhMoiCache,
    enhanceGameUI: enhanceGameUI
  };
})();
