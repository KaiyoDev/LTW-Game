/* game.js: Chương 1 "Căn phòng khóa trái ở hẻm 41".
   3 phòng: Phòng trọ số 4 (A), Hành lang và cầu thang (B), Sân thượng phơi đồ (C).
   Câu đố chơi được: 1.1, 1.2, 1.4, 1.8. Đáp án đối chiếu ở server qua action solve.
   Chỉ dùng id có sẵn trong game.html, không thêm hay xóa thẻ. */
(function(){
  "use strict";

  /* ================= DỮ LIỆU CHƯƠNG ================= */
  var ICONS = {
    hook: '<svg viewBox="0 0 48 48" fill="none" stroke="#5c554a" stroke-width="3.2" stroke-linecap="round"><path d="M24 6 q8 0 8 7 q0 6-8 7 v6"/><path d="M8 38 L24 26 L40 38 Z"/><path d="M24 38 q-6 0-6 5"/></svg>',
    dongkey: '<svg viewBox="0 0 48 48" fill="none" stroke="#a8802f" stroke-width="3.4" stroke-linecap="round"><circle cx="15" cy="15" r="8"/><line x1="21" y1="21" x2="40" y2="40"/><line x1="33" y1="33" x2="39" y2="27"/><line x1="38" y1="38" x2="43" y2="32"/></svg>',
    mirror: '<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="18" rx="11" ry="13" fill="#cfd8dc" stroke="#6b5b3e" stroke-width="3"/><line x1="24" y1="31" x2="24" y2="44" stroke="#6b5b3e" stroke-width="4" stroke-linecap="round"/></svg>',
    page1: '<svg viewBox="0 0 48 48" fill="none"><rect x="10" y="6" width="28" height="36" rx="2" fill="#efe6cc" stroke="#7a5a2e" stroke-width="2.4"/><line x1="15" y1="15" x2="33" y2="15" stroke="#7a5a2e" stroke-width="2"/><line x1="15" y1="21" x2="33" y2="21" stroke="#7a5a2e" stroke-width="2"/><circle cx="31" cy="34" r="4" fill="#22242a"/></svg>'
  };
  var ITEM_NAMES = { hook:"Móc áo uốn cong", dongkey:"Chìa đồng", mirror:"Gương cầm tay", page1:"Trang sổ số 1" };
  var ITEM_DESC = {
    hook:"Móc áo sắt uốn cong, luồn được xuống gầm giường.",
    dongkey:"Chìa đồng nhặt từ chậu cây giấy ở sân thượng phơi đồ.",
    mirror:"Gương nhỏ, hứng nắng soi được chỗ tối.",
    page1:"Trang sổ tay chép số cân thật chuyến 19/01: 226 kg."
  };
  /* ma_vat_pham trong bảng VAT_PHAM (backend/db/seed.sql) */
  var VAT_PHAM_IDS = { hook:9, dongkey:1, page1:2, mirror:10 };
  var ROOMS = ["A","B","C"];
  var ROOM_NAMES = { A:"Phòng trọ số 4", B:"Hành lang và cầu thang", C:"Sân thượng phơi đồ" };
  var ROOM_TO_MA_PHONG = { A:1, B:2, C:3 };
  /* Đồ vật mỗi phòng gắn lên hotspot có sẵn theo data-act. Hotspot không có trong
     bảng này thì ẩn đi, vì không thuộc cảnh Chương 1. */
  var HOTSPOTS = {
    A: { door:"Cửa phòng trọ số 4", rug:"Hộp thiếc dưới gầm giường", clock:"Tủ áo gỗ", window:"Cửa sổ nhìn ra hành lang", cushion:"Bàn viết, radio cassette" },
    B: { bwindow:"Cửa gỗ vào Phòng số 4", photo:"Bức ảnh gia đình", bed:"Dây phơi", chest:"Điện thoại bàn", wardrobe:"Cầu thang lên sân thượng" },
    C: { safe:"Cầu thang xuống hành lang", sink:"Bồn nước", shelf:"Chậu cây giấy", radio:"Gương cầm tay" }
  };
  /* Câu 1.3, 1.5, 1.6, 1.7 mới xem được, chưa giải được trong bản demo */
  var VIEW_ONLY = " (Câu đố này chưa giải được trong bản demo.)";
  /* Vị trí An đứng khi vừa bước qua cửa nối, theo % chiều ngang cảnh */
  var ENTRY_X = { A:86, B:16, Bstairs:86, C:82 };

  /* ================= STATE ================= */
  var S = {
    room:"A", started:false, startTime:0, ended:false,
    boltOpen:false, hookGot:false, tinOpen:false, mirrorGot:false, potDone:false, strangerDone:false,
    hintsUsed:0, sound:true
  };
  var inv = [];
  var selected = null;
  var maLuu = null;

  /* ================= DOM ================= */
  function $(id){ return document.getElementById(id); }
  var dialogueEl = $("dialogueText"), toastEl = $("toast");

  /* ================= NHÂN VẬT: di chuyển + cầm nắm ================= */
  var playerEl = $("player"), heldEl = $("heldItem"), markerEl = $("clickMarker"), ringEl = $("targetRing"), shellEl = $("sceneShell");
  var playerX = 42, playerY = 93, targetX = 42, targetY = 93;
  var isWalking = false, pendingAction = null, pendingActName = null, keyDir = 0;
  var PICKUP_ACTS = { rug:1, clock:1, shelf:1, radio:1 };
  function playerScale(){ return 0.86 + Math.max(0, Math.min(1, (playerY - 84) / 13)) * 0.26; }
  function paintPlayer(){
    playerEl.style.left = playerX + "%";
    playerEl.style.top = playerY + "%";
    playerEl.style.transform = "translate(-50%,-100%) scale(" + playerScale().toFixed(3) + ")";
    playerEl.style.zIndex = playerY > 90 ? 7 : 6;
  }
  function updateHeld(){
    if(selected && ICONS[selected]){ heldEl.innerHTML = ICONS[selected]; playerEl.classList.add("has-held"); }
    else { heldEl.innerHTML = ""; playerEl.classList.remove("has-held"); }
  }
  function bendPickup(){
    playerEl.classList.remove("bending"); void playerEl.offsetWidth;
    playerEl.classList.add("bending");
    setTimeout(function(){ playerEl.classList.remove("bending"); }, 600);
  }
  function showMarker(xPct, yPct){
    markerEl.style.left = xPct + "%"; markerEl.style.top = yPct + "%";
    markerEl.classList.remove("pop"); void markerEl.offsetWidth; markerEl.classList.add("pop");
  }
  function showRingFor(el){
    var sr = shellEl.getBoundingClientRect(), r = el.getBoundingClientRect();
    ringEl.style.left = (r.left - sr.left) + "px"; ringEl.style.top = (r.top - sr.top) + "px";
    ringEl.style.width = r.width + "px"; ringEl.style.height = r.height + "px";
    ringEl.classList.add("show");
    setTimeout(function(){ ringEl.classList.remove("show"); }, 900);
  }
  function anyModalOpen(){
    return $("introOverlay").classList.contains("open") || $("closeOverlay").classList.contains("open") || $("endOverlay").classList.contains("open");
  }
  function walkTo(x, y, after, actName){
    targetX = Math.max(6, Math.min(94, x));
    targetY = Math.max(84, Math.min(97, y == null ? 93 : y));
    pendingAction = after || null;
    pendingActName = actName || null;
    showMarker(targetX, targetY);
    if(Math.abs(targetX - playerX) > 0.8) playerEl.classList.toggle("flip", targetX < playerX);
    isWalking = true;
    playerEl.classList.add("walking");
  }
  function arrive(){
    isWalking = false;
    playerEl.classList.remove("walking");
    paintPlayer();
    if(pendingAction){
      var fn = pendingAction, an = pendingActName;
      pendingAction = null; pendingActName = null;
      if(an && PICKUP_ACTS[an]) bendPickup();
      setTimeout(fn, (an && PICKUP_ACTS[an]) ? 260 : 60);
    }
  }
  var lastTs = 0;
  function loop(ts){
    var dt = Math.min(0.05, lastTs ? (ts - lastTs) / 1000 : 0.016);
    lastTs = ts;
    if(S.started && !anyModalOpen()){
      if(keyDir !== 0){
        pendingAction = null; isWalking = false;
        playerX = Math.max(6, Math.min(94, playerX + keyDir * 28 * dt));
        targetX = playerX; targetY = playerY;
        playerEl.classList.toggle("flip", keyDir < 0);
        playerEl.classList.add("walking");
        paintPlayer();
      } else if(isWalking){
        var dx = targetX - playerX, dy = targetY - playerY;
        var d = Math.sqrt(dx*dx + dy*dy);
        if(d < 0.8){ playerX = targetX; playerY = targetY; arrive(); }
        else {
          var sp = 44 * dt;
          playerX += dx / d * Math.min(sp, d);
          playerY += dy / d * Math.min(sp * 0.55, Math.abs(dy));
          playerEl.classList.add("walking");
          paintPlayer();
        }
      } else playerEl.classList.remove("walking");
    }
    requestAnimationFrame(loop);
  }
  paintPlayer();
  requestAnimationFrame(loop);
  document.addEventListener("keydown", function(e){
    if(!S.started || anyModalOpen()) return;
    if(e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keyDir = -1;
    else if(e.key === "ArrowRight" || e.key === "d" || e.key === "D") keyDir = 1;
    else if(e.key === "e" || e.key === "E") interactNearest();
  });
  document.addEventListener("keyup", function(e){
    if(["ArrowLeft","ArrowRight","a","A","d","D"].indexOf(e.key) >= 0) keyDir = 0;
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && $("closeOverlay").classList.contains("open")) closeModal();
  });
  function interactNearest(){
    var scene = document.querySelector(".scene.active");
    var best = null, bestD = 1e9;
    scene.querySelectorAll(".hotspot").forEach(function(h){
      if(h.style.display === "none") return;
      var d = Math.abs(parseFloat(h.style.left) + parseFloat(h.style.width) / 2 - playerX);
      if(d < bestD){ bestD = d; best = h; }
    });
    if(best) best.click();
  }
  /* Chạm vào sàn = đi tới đó */
  shellEl.addEventListener("click", function(e){
    if(!S.started || anyModalOpen()) return;
    if(e.target.closest(".hotspot") || e.target.closest(".player")) return;
    var r = shellEl.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * 100;
    var y = (e.clientY - r.top) / r.height * 100;
    if(y < 58) y = 93; /* bấm lên tường thì chỉ đi ngang tới phía dưới */
    walkTo(x, Math.max(86, Math.min(97, y)), null, null);
  });

  /* ================= ÂM THANH ================= */
  var actx = null;
  function ac(){ if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ actx = null; } } if(actx && actx.state === "suspended") actx.resume(); return actx; }
  function tone(f, t, dur, type, g){
    if(!S.sound) return; var c = ac(); if(!c) return;
    var o = c.createOscillator(), gn = c.createGain();
    o.type = type || "sine"; o.frequency.value = f;
    gn.gain.setValueAtTime(g || 0.08, c.currentTime + (t || 0));
    gn.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (t || 0) + dur);
    o.connect(gn); gn.connect(c.destination);
    o.start(c.currentTime + (t || 0)); o.stop(c.currentTime + (t || 0) + dur + 0.05);
  }
  function sndClick(){ tone(620, 0, 0.06, "triangle", 0.05); }
  function sndPickup(){ tone(523,0,0.12,"sine",0.08); tone(784,0.09,0.18,"sine",0.08); }
  function sndError(){ tone(140,0,0.22,"sawtooth",0.06); }
  function sndUnlock(){ tone(392,0,0.1,"square",0.05); tone(587,0.1,0.14,"square",0.05); tone(880,0.22,0.3,"sine",0.07); }

  /* ================= GIAO DIỆN PHỤ ================= */
  var typeTimer = null;
  function say(text){
    clearInterval(typeTimer);
    dialogueEl.textContent = "";
    var i = 0;
    typeTimer = setInterval(function(){
      i++;
      dialogueEl.textContent = text.slice(0, i);
      if(i >= text.length) clearInterval(typeTimer);
    }, 11);
  }
  var toastTimer = null;
  function toast(text){
    toastEl.textContent = text; toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, 2600);
  }
  function openModal(html){ $("closeCard").innerHTML = html; $("closeOverlay").classList.add("open"); bindClose(); }
  function closeModal(){ $("closeOverlay").classList.remove("open"); }
  function bindClose(){
    $("closeCard").querySelectorAll("[data-close]").forEach(function(b){
      b.addEventListener("click", function(){ sndClick(); closeModal(); });
    });
  }
  $("closeOverlay").addEventListener("click", function(e){ if(e.target === this) closeModal(); });
  function setObjective(t){ $("objectiveText").textContent = t; }
  function shake(el){ el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

  /* ================= TÚI ĐỒ ================= */
  function has(id){ return inv.indexOf(id) >= 0; }
  function addItem(id){
    if(has(id)) return;
    inv.push(id); renderInv(); sndPickup();
    toast("Đã nhặt: " + ITEM_NAMES[id]);
  }
  function renderInv(){
    var box = $("inventory"); box.innerHTML = "";
    updateHeld();
    if(inv.length === 0){
      box.innerHTML = '<div class="inv-empty">Túi trống. Chạm vào đồ vật trong phòng, An sẽ tự bước tới xem hoặc nhặt.</div>';
      return;
    }
    inv.forEach(function(id){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot filled" + (selected === id ? " selected" : "");
      b.innerHTML = ICONS[id] + '<span class="nm">' + ITEM_NAMES[id] + "</span>";
      b.setAttribute("aria-label", ITEM_NAMES[id]);
      b.addEventListener("click", function(){
        sndClick();
        if(selected === id){ selected = null; say("An cất " + ITEM_NAMES[id].toLowerCase() + " lại vào túi."); }
        else { selected = id; say("An cầm " + ITEM_NAMES[id].toLowerCase() + " trên tay. " + ITEM_DESC[id]); }
        renderInv();
      });
      box.appendChild(b);
    });
  }

  /* ================= SERVER: nhặt đồ và giải đố ================= */
  /* Frontend không biết đáp án. Mỗi câu đố chỉ gửi lên server những gì người chơi
     đã làm, server đối chiếu với cột dap_an trong action solve. */
  function serverUnavailable(err){
    return !err.status || err.status === 401 || err.status === 404;
  }
  function serverPickup(id){
    return QD.api("pickup", { method:"POST", body:{ ma_vat_pham: VAT_PHAM_IDS[id] } }).then(function(){
      return true;
    }, function(err){
      if(serverUnavailable(err)){ toast("Chưa ghi túi đồ lên server: " + err.message); return true; }
      toast("Server từ chối nhặt đồ: " + err.message);
      return false;
    });
  }
  /* Giải đúng thì server tự thêm vật phẩm thưởng vào TUI_DO và trả về vat_pham_thuong */
  function serverSolve(maCauDo, thaoTac, onOk, onFail){
    var body = { ma_cau_do: maCauDo, dap_an: thaoTac };
    if(maLuu) body.ma_luu = maLuu;
    QD.api("solve", { method:"POST", body: body }).then(function(res){
      var d = (res && res.data) || {};
      /* Sai đáp án: server vẫn trả HTTP 200 nhưng correct là false */
      if(d.correct !== true){ sndError(); onFail("Chưa đúng, thử lại."); return; }
      var v = d.vat_pham_thuong;
      var ma = (v && typeof v === "object") ? v.ma_vat_pham : v;
      Object.keys(VAT_PHAM_IDS).forEach(function(k){ if(VAT_PHAM_IDS[k] === Number(ma)) addItem(k); });
      onOk();
    }, function(err){
      sndError();
      if(err.status === 401) onFail("Cần đăng nhập để giải đố.");
      else if(serverUnavailable(err)) onFail("Chưa kiểm tra được vì chưa kết nối server giải đố (" + err.message + ").");
      else onFail("Server báo: " + err.message + ".");
    });
  }

  /* ================= PHÒNG ================= */
  function setupHotspots(){
    document.querySelectorAll(".scene").forEach(function(scene){
      var room = scene.id.replace("scene-", "");
      scene.querySelectorAll(".hotspot").forEach(function(h){
        var label = HOTSPOTS[room] && HOTSPOTS[room][h.getAttribute("data-act")];
        if(label){ h.setAttribute("aria-label", label); h.title = label; }
        else h.style.display = "none";
      });
    });
    $("roomName").textContent = ROOM_NAMES[S.room];
    $("roomTag").textContent = ROOM_NAMES[S.room];
    /* Chương 1 đi qua cửa thật, không dùng mũi tên chuyển cảnh */
    $("navLeft").style.display = "none";
    $("navRight").style.display = "none";
  }
  function goRoom(r, entryX){
    S.room = r;
    ROOMS.forEach(function(k){ $("scene-" + k).classList.toggle("active", k === r); });
    $("roomName").textContent = ROOM_NAMES[r];
    $("roomTag").textContent = ROOM_NAMES[r];
    isWalking = false; pendingAction = null; playerEl.classList.remove("walking");
    if(typeof entryX === "number"){ playerX = entryX; targetX = entryX; }
    playerY = 93; targetY = 93; paintPlayer();
    say(ROOM_NAMES[r]);
    sndClick();
  }

  /* ================= CÂU ĐỐ 1.1: chốt cửa rãnh chữ L ================= */
  /* Người chơi làm 2 thao tác liên tiếp, gửi cả chuỗi lên server, ví dụ "xuong,trai" */
  var BOLT_MOVES = { keo:"Kéo thẳng ra", xuong:"Đẩy xuống", trai:"Trượt sang trái", phai:"Trượt sang phải" };
  var BOLT_POS = { "":[70,40], keo:[70,40], xuong:[70,95], trai:[25,95], phai:[70,95] };
  function boltSVG(lastMove){
    var k = BOLT_POS[lastMove] || BOLT_POS[""];
    return '<svg viewBox="0 0 120 130" style="width:100%;height:100%">' +
      '<rect x="5" y="5" width="110" height="120" rx="6" fill="#6e4e38"/>' +
      '<path d="M70 30 V95 H25" stroke="#2a1d14" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + k[0] + '" cy="' + k[1] + '" r="10" fill="#c8a75a" stroke="#3c281a" stroke-width="3"/></svg>';
  }
  function openBolt(){
    var moves = [];
    openModal('<button class="close-x" type="button" data-close>✕</button>' +
      "<h2>Chốt cửa gài theo rãnh chữ L</h2>" +
      '<p class="sub">Cạnh chốt trong có một rãnh xước cũ hình chữ L. Tay nắm chốt mòn bóng đúng hai đoạn của rãnh. Làm 2 thao tác liên tiếp.</p>' +
      '<div class="clockface" id="boltFace">' + boltSVG("") + "</div>" +
      '<div class="steppers">' +
        Object.keys(BOLT_MOVES).map(function(k){ return '<button class="btn ghost" type="button" data-bolt="' + k + '">' + BOLT_MOVES[k] + "</button>"; }).join("") +
      "</div>" +
      '<p class="sub" id="boltMsg"></p>');
    $("closeCard").querySelectorAll("[data-bolt]").forEach(function(b){
      b.addEventListener("click", function(){
        if(moves.length >= 2) return;
        var mv = b.getAttribute("data-bolt");
        moves.push(mv); sndClick();
        $("boltFace").innerHTML = boltSVG(mv);
        $("boltMsg").textContent = "Đã làm: " + moves.map(function(m){ return BOLT_MOVES[m].toLowerCase(); }).join(", ") + ".";
        if(moves.length < 2) return;
        serverSolve(1, moves.join(","), function(){
          S.boltOpen = true;
          closeModal(); sndUnlock();
          setObjective("Cửa đã mở. Tìm thứ kéo được hộp thiếc dưới gầm giường.");
          say("An mở cửa ra hành lang lần đầu tiên.");
        }, function(msg){
          moves = [];
          shake($("closeCard"));
          $("boltFace").innerHTML = boltSVG("");
          $("boltMsg").textContent = msg + " Chốt trở về chỗ cũ.";
        });
      });
    });
  }

  /* ================= CÂU ĐỐ 1.4: chậu cây giấy ================= */
  /* Vết xước dưới nền là manh mối người chơi nhìn thấy, không phải bước kiểm tra.
     Người chơi xoay chậu tới nấc bất kỳ, rót nước rồi thả tay, gửi "nac<số>,vach<số>". */
  var POT_SCRATCH = 5;
  function potSVG(pos){
    var a = pos * 45, scratch = POT_SCRATCH * 45;
    return '<svg viewBox="0 0 190 190" style="width:100%;height:100%">' +
      '<circle cx="95" cy="95" r="88" fill="#b9a988"/>' +
      '<g transform="rotate(' + (scratch - 40) + ' 95 95)"><path d="M95 17 A78 78 0 0 1 145 35" stroke="#6b5b3e" stroke-width="3" fill="none" stroke-dasharray="4 3"/></g>' +
      '<g transform="rotate(' + scratch + ' 95 95)"><line x1="95" y1="10" x2="95" y2="24" stroke="#3c281a" stroke-width="4"/></g>' +
      '<circle cx="95" cy="95" r="58" fill="#96603a" stroke="#5a3a22" stroke-width="5"/>' +
      '<path d="M95 95 q-30-40-8-62 q22 18 10 60 M95 95 q30-30 46-10 q-20 26-46 12" fill="#3f5d43"/>' +
      '<g transform="rotate(' + a + ' 95 95)"><rect x="89" y="32" width="12" height="10" rx="2" fill="#e6ddc2" stroke="#3c281a" stroke-width="2"/></g></svg>';
  }
  function jugSVG(level){
    var h = Math.min(3.3, level) / 3 * 120;
    return '<svg viewBox="0 0 120 150" style="width:100%;height:100%">' +
      '<rect x="20" y="15" width="80" height="125" rx="8" fill="#e9dfc4" stroke="#3c281a" stroke-width="4"/>' +
      '<rect x="24" y="' + (136 - h) + '" width="72" height="' + h + '" fill="#6fa3c7"/>' +
      [1,2,3].map(function(v){ var y = 136 - v * 40; return '<line x1="20" y1="' + y + '" x2="44" y2="' + y + '" stroke="#8a3324" stroke-width="3"/><text x="48" y="' + (y + 5) + '" font-size="14" fill="#3c281a">' + v + "</text>"; }).join("") +
      "</svg>";
  }
  /* Mặt nước cách vạch gần nhất không quá 0,15 thì tính là chạm vạch đó */
  function levelToMark(level){
    var m = Math.round(level);
    return (m >= 1 && m <= 3 && Math.abs(level - m) <= 0.15) ? "vach" + m : "lech";
  }
  function openPot(){
    var pos = 0, level = 0, pourTimer = null, busy = false;
    openModal('<button class="close-x" type="button" data-close>✕</button>' +
      "<h2>Chậu cây giấy xoay theo vết xước</h2>" +
      '<p class="sub">Dưới chân chậu có một vết xước cong trên nền gạch. Đáy chậu có một mấu nhựa nhỏ. Ca tưới cây treo cạnh chậu khắc ba vạch nước. Xoay chậu, rồi giữ nút để rót, thả tay để dừng.</p>' +
      '<div class="clockface" id="potFace">' + potSVG(0) + "</div>" +
      '<div class="steppers">' +
        '<button class="btn ghost" type="button" id="potLeft">Xoay trái một nấc</button>' +
        '<button class="btn ghost" type="button" id="potRight">Xoay phải một nấc</button>' +
      "</div>" +
      '<div class="clockface" id="jugFace">' + jugSVG(0) + "</div>" +
      '<button class="btn" type="button" id="potPour">Giữ để rót nước</button>' +
      '<p class="sub" id="potMsg"></p>');
    function turn(dir){
      if(busy || pourTimer) return;
      pos = (pos + dir + 8) % 8; sndClick();
      $("potFace").innerHTML = potSVG(pos);
    }
    $("potLeft").onclick = function(){ turn(-1); };
    $("potRight").onclick = function(){ turn(1); };
    function startPour(e){
      e.preventDefault();
      if(busy || pourTimer) return;
      level = 0;
      pourTimer = setInterval(function(){
        level += 0.05;
        $("jugFace").innerHTML = jugSVG(level);
        if(level > 3.2) stopPour();
      }, 40);
    }
    function stopPour(){
      if(!pourTimer) return;
      clearInterval(pourTimer); pourTimer = null;
      busy = true;
      serverSolve(4, "nac" + pos + "," + levelToMark(level), function(){
        S.potDone = true;
        closeModal();
        setObjective("Ngăn dưới đáy chậu đã mở. Về Phòng trọ số 4.");
        say("Nghe tiếng cạch. Ngăn dưới đáy chậu bật mở.");
      }, function(msg){
        busy = false;
        level = 0;
        $("jugFace").innerHTML = jugSVG(0);
        $("potMsg").textContent = msg + " Nước đã đổ ra, làm lại.";
      });
    }
    var pour = $("potPour");
    pour.addEventListener("pointerdown", startPour);
    pour.addEventListener("pointerup", stopPour);
    pour.addEventListener("pointerleave", stopPour);
  }

  /* ================= CÂU ĐỐ 1.8: nói dối người lạ qua cửa sổ ================= */
  /* Gửi số thứ tự câu trả lời người chơi chọn (1, 2, 3), server quyết đúng sai */
  var STRANGER_CHOICES = [
    "Nhận mình là cháu của ông Bảo.",
    "Nói mình là người dọn phòng thuê, phòng chưa cho thuê lại, đồ đạc là của bà Sáu cho người thuê mượn."
  ];
  function openStranger(){
    var busy = false;
    openModal('<button class="close-x" type="button" data-close>✕</button>' +
      "<h2>Nói dối người lạ qua cửa phòng</h2>" +
      "<p>Người đàn ông lạ tới xem phòng sớm hơn lời hẹn, đứng ở hành lang và hỏi qua cửa sổ xem trong phòng có giấy tờ gì của người thuê cũ không.</p>" +
      '<p class="sub">Trước đó bà Sáu đã dặn hai chi tiết: phòng chưa cho thuê lại, và đồ đạc trong phòng là đồ của bà cho mượn.</p>' +
      STRANGER_CHOICES.map(function(text, i){ return '<button class="btn ghost" type="button" data-choice="' + (i + 1) + '" style="display:block;width:100%;margin:6px 0;text-align:left">' + text + "</button>"; }).join("") +
      '<p class="sub" id="strangerMsg"></p>');
    $("closeCard").querySelectorAll("[data-choice]").forEach(function(b){
      b.addEventListener("click", function(){
        if(busy) return;
        busy = true;
        serverSolve(8, b.getAttribute("data-choice"), function(){
          S.strangerDone = true;
          closeModal();
          finishChapter();
        }, function(msg){
          busy = false;
          shake($("closeCard"));
          $("strangerMsg").textContent = msg + " Người lạ hỏi tiếp hai câu nữa.";
        });
      });
    });
  }

  /* ================= KẾT CHƯƠNG ================= */
  function fmtTime(ms){
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }
  function finishChapter(){
    if(S.ended) return;
    S.ended = true;
    $("doorGlow").style.display = "block";
    sndUnlock();
    say("Người lạ bỏ đi trước khi bà Sáu khóa cổng. An mang Trang sổ số 1 ra khỏi nhà trọ an toàn.");
    setTimeout(function(){
      $("endTime").textContent = fmtTime(Date.now() - S.startTime);
      $("endHints").textContent = S.hintsUsed;
      $("endOverlay").classList.add("open");
      qdSave(true);
    }, 1600);
  }

  /* ================= HOTSPOT ================= */
  var ACTIONS = {
    /* ---- Phòng trọ số 4 ---- */
    door: function(){
      if(!S.boltOpen){ openBolt(); return; }
      goRoom("B", ENTRY_X.B);
    },
    window: function(){
      if(S.potDone && !S.strangerDone){ openStranger(); return; }
      say("An trèo qua cửa sổ hành lang vào phòng, như hồi còn nhỏ vẫn trèo vào phòng chú để mượn truyện.");
    },
    rug: function(){
      if(S.tinOpen){ say("Hộp thiếc đã mở. Trong hộp có một cuộn băng ghi âm nhỏ và một tờ giấy gấp tư theo nếp cũ của chú Bảo."); return; }
      /* Gửi mã vật phẩm đang cầm, server quyết có kéo được hộp không */
      if(selected){
        var used = ITEM_NAMES[selected].toLowerCase();
        serverSolve(2, String(VAT_PHAM_IDS[selected]), function(){
          S.tinOpen = true;
          setObjective("Hộp thiếc đã mở. Lên sân thượng xoay chậu cây giấy theo vết xước dưới nền.");
          say("An nằm xuống cạnh giường, luồn " + used + " vào gầm, móc vào quai hộp thiếc và kéo từ từ ra. Trong hộp có một cuộn băng ghi âm nhỏ và một tờ giấy gấp tư theo nếp cũ.");
        }, function(msg){ say("An làm động tác thử rồi lắc đầu. " + msg); });
        return;
      }
      say("Dưới gầm giường có một hộp thiếc nằm sâu sát tường, với tay không tới. Cần một vật dài có móc ở đầu." + (inv.length ? " (Chạm vào một món trong túi đồ để cầm lên rồi thử.)" : ""));
    },
    cushion: function(){
      if(!S.tinOpen){ say("Chiếc radio cassette trên bàn." + VIEW_ONLY); return; }
      say("Cuộn băng trong hộp thiếc phát tiếng mưa rất to, rồi tiếng chuông nhà thờ vọng lại, rồi giọng chú Bảo: Đếm chuông thì biết ngăn nào." + VIEW_ONLY);
    },
    clock: function(){
      if(!S.hookGot){
        serverPickup("hook").then(function(ok){
          if(!ok) return;
          S.hookGot = true;
          addItem("hook");
          say("Tủ áo gỗ: móc áo sắt uốn cong, luồn được xuống gầm giường.");
        });
        return;
      }
      say("Tủ áo của chú Bảo có sáu ngăn kéo nhỏ đánh số bằng vết khắc. Ngăn kéo số sáu khóa bằng chìa đồng nhỏ." + VIEW_ONLY);
    },
    /* ---- Hành lang và cầu thang ---- */
    bwindow: function(){
      goRoom("A", ENTRY_X.A);
    },
    photo: function(){
      say("Bức ảnh gia đình: chú Bảo đứng cạnh chậu cây giấy và tay chỉ xuống chân chậu. Mặt sau ảnh có vết bút chì rất mờ, nhìn thẳng không đọc được." + VIEW_ONLY);
    },
    bed: function(){
      say("Dây phơi.");
    },
    chest: function(){
      say("Điện thoại bàn.");
    },
    wardrobe: function(){
      goRoom("C", ENTRY_X.C);
    },
    /* ---- Sân thượng phơi đồ ---- */
    safe: function(){
      goRoom("B", ENTRY_X.Bstairs);
    },
    sink: function(){
      say("Dưới bồn nước có một khe hẹp tối om, thò tay vào không thấy gì." + VIEW_ONLY);
    },
    shelf: function(){
      if(S.potDone){ say("Ngăn dưới đáy chậu đã mở."); return; }
      openPot();
    },
    radio: function(){
      if(S.mirrorGot){ say("Gương cầm tay đã ở trong túi đồ."); return; }
      serverPickup("mirror").then(function(ok){
        if(!ok) return;
        S.mirrorGot = true;
        addItem("mirror");
        say("Gương cầm tay: gương nhỏ, hứng nắng soi được chỗ tối.");
      });
    }
  };
  document.querySelectorAll(".hotspot").forEach(function(h){
    h.addEventListener("click", function(e){
      if(!S.started || anyModalOpen()) return;
      e.stopPropagation();
      var act = h.getAttribute("data-act");
      if(!ACTIONS[act] || h.style.display === "none") return;
      showRingFor(h);
      /* Điểm đứng: ngay phía trước đồ vật, trên dải sàn */
      var standX = Math.max(9, Math.min(91, parseFloat(h.style.left) + parseFloat(h.style.width) / 2));
      var doAct = function(){ sndClick(); ACTIONS[act](); };
      if(Math.abs(playerX - standX) < 4 && !isWalking){ doAct(); return; }
      walkTo(standX, 93, doAct, act);
    });
  });

  /* ================= GỢI Ý ================= */
  function currentHint(){
    if(!S.boltOpen) return "Rãnh chữ L chỉ có một đường đi duy nhất, kéo chốt men theo rãnh.";
        if(!S.tinOpen) return "Hộp nằm ngoài tầm tay, cần một vật dài có móc ở đầu.";
    if(!S.potDone) return "Xoay chậu cây theo vết xước, bên dưới có chìa đồng.";
    return "Câu trả lời an toàn phải khớp cả hai chi tiết bà Sáu đã nói qua điện thoại.";
  }
  $("btnHint").addEventListener("click", function(){
    if(!S.started) return;
    S.hintsUsed++;
    sndClick();
    openModal('<button class="close-x" type="button" data-close>✕</button><h2>Gợi ý</h2><p>' + currentHint() + '</p><p class="sub">Đã dùng ' + S.hintsUsed + ' gợi ý.</p><button class="btn" type="button" data-close>Đã hiểu</button>');
  });

  /* ================= THANH TRÊN ================= */
  $("btnSound").addEventListener("click", function(){
    S.sound = !S.sound;
    $("soundLabel").textContent = S.sound ? "Âm thanh: bật" : "Âm thanh: tắt";
    if(S.sound) sndClick();
  });
  $("btnRestart").addEventListener("click", function(){ location.reload(); });
  $("btnAgain").addEventListener("click", function(){ location.reload(); });
  $("btnStart").addEventListener("click", function(){
    S.started = true;
    if(!S.startTime) S.startTime = Date.now();
    $("introOverlay").classList.remove("open");
    ac(); sndClick();
    paintPlayer();
    setObjective("Mở chốt trong của cửa gỗ bên phải để ra hành lang.");
    say("Nhà trọ Sáu Lành, hẻm 41 Nguyễn Trãi, Q5. Sáng 10/03/1998. An trèo qua cửa sổ hành lang vào phòng.");
    setTimeout(function(){ walkTo(30, 93, null, null); }, 350);
  });

  /* ================= LƯU / TẢI GAME QUA BACKEND ================= */
  /* Đăng nhập bằng session cookie: không kiểm tra token ở frontend, cứ gọi API,
     server trả 401 thì báo chưa đăng nhập. */
  var CAU_DO_FLAGS = { 1:"boltOpen", 2:"tinOpen", 4:"potDone", 8:"strangerDone" };
  var MA_PHONG_TO_ROOM = { 1:"A", 2:"B", 3:"C" };
  function errText(err, viec){
    return err.status === 401 ? "Cần đăng nhập để " + viec + "." : viec.charAt(0).toUpperCase() + viec.slice(1) + " thất bại: " + (err.message || "lỗi kết nối");
  }
  function qdSave(done){
    var body = {
      ma_chuong: 1,
      ma_phong_hien_tai: ROOM_TO_MA_PHONG[S.room],
      thoi_gian_choi: Math.floor((S.started ? Date.now() - S.startTime : 0) / 1000),
      so_goi_y_da_dung: S.hintsUsed,
      da_hoan_thanh: !!done,
      cau_do_da_giai: Object.keys(CAU_DO_FLAGS).filter(function(ma){ return S[CAU_DO_FLAGS[ma]]; }).map(Number)
    };
    if(maLuu) body.ma_luu = maLuu;
    QD.saveGame(body).then(function(res){
      if(res && res.data && res.data.ma_luu) maLuu = res.data.ma_luu;
      toast(done ? "Đã lưu: Chương 1 hoàn thành." : "Đã lưu tiến trình Chương 1 lên máy chủ.");
      qdRefreshServerInv();
      if(done){
        QD.api("leaderboard", {
          method: "POST",
          body: {
            ma_chuong: 1,
            thoi_gian_hoan_thanh: Math.max(1, body.thoi_gian_choi)
          }
        }).catch(function(){});
      }
    }, function(err){ toast(errText(err, "lưu game")); });
  }
  /* Túi đồ lấy từ bảng TUI_DO trên server */
  function applyServerInv(items){
    inv = [];
    items.forEach(function(it){
      Object.keys(VAT_PHAM_IDS).forEach(function(k){ if(VAT_PHAM_IDS[k] === Number(it.ma_vat_pham)) inv.push(k); });
    });
    S.hookGot = has("hook");
    S.mirrorGot = has("mirror");
    selected = null;
    renderInv();
  }
  function qdLoad(){
    QD.loadGame(1).then(function(res){
      var d = (res && res.data) || {};
      if(d.ma_chuong !== 1){ toast("Bản lưu gần nhất không phải Chương 1."); return; }
      maLuu = d.ma_luu;
      Object.keys(CAU_DO_FLAGS).forEach(function(ma){ S[CAU_DO_FLAGS[ma]] = false; });
      (d.tien_do_cau_do || []).forEach(function(t){
        if(t.da_hoan_thanh && CAU_DO_FLAGS[t.ma_cau_do]) S[CAU_DO_FLAGS[t.ma_cau_do]] = true;
      });
      S.hintsUsed = d.so_goi_y_da_dung || 0;
      S.startTime = Date.now() - (d.thoi_gian_choi || 0) * 1000;
      S.ended = false; S.started = true;
      $("introOverlay").classList.remove("open");
      goRoom(MA_PHONG_TO_ROOM[d.ma_phong_hien_tai] || "A", 50);
      return QD.getInventory().then(function(r){
        applyServerInv((r && r.data) || []);
        qdRefreshServerInv();
        say("Đã tải bản lưu. Tiếp tục tìm Trang sổ số 1.");
        toast("Đã tải tiến trình Chương 1.");
      });
    }).catch(function(err){
      toast(err.status === 404 && /ban luu/i.test(err.message || "") ? "Chưa có bản lưu nào trên máy chủ." : errText(err, "tải game"));
    });
  }
  function qdRefreshServerInv(){
    var box = $("serverInv");
    QD.getInventory().then(function(res){
      $("gameUser").textContent = "Đã đăng nhập, tiến trình lưu được lên máy chủ.";
      var items = (res && res.data) || [];
      if(!items.length){ box.textContent = "Túi đồ trên máy chủ: trống."; return; }
      box.textContent = "Túi đồ trên máy chủ (" + items.length + " loại): " + items.map(function(it){ return it.ten_vat_pham + " × " + (it.so_luong || 1); }).join(", ") + ".";
    }, function(err){
      if(err.status === 401){
        $("gameUser").textContent = "Chưa đăng nhập, chơi khách, không lưu được.";
        box.textContent = "Chưa đăng nhập: túi đồ trên máy chủ chưa đồng bộ.";
      } else {
        $("gameUser").textContent = "Chưa kết nối được máy chủ, chưa lưu được.";
        box.textContent = "Không tải được túi đồ trên máy chủ.";
      }
    });
  }
  $("btnSave").addEventListener("click", function(){
    if(S.started) qdSave(false);
    else toast("Bấm Bước vào phòng trọ để bắt đầu chơi trước.");
  });
  $("btnLoad").addEventListener("click", qdLoad);

  setupHotspots();
  qdRefreshServerInv();
  renderInv();
})();
