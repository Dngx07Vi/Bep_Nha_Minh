// ================== DỮ LIỆU ==================
var STORAGE_KEY = "recipes";

var ICONS = {
  "Món chính": "🍲",
  "Món phụ": "🥗",
  "Tráng miệng": "🍮",
  "Đồ uống": "🍹"
};

// Dữ liệu mẫu khi mở web lần đầu
var sampleRecipes = [
  {
    id: 1, name: "Phở bò", category: "Món chính", level: "Khó", time: 180, servings: 4, favorite: true,
    ingredients: ["500 g thịt bò", "1 kg xương ống", "400 g bánh phở", "2 củ hành tây", "1 nhánh gừng", "3 hoa hồi"],
    steps: ["Ninh xương ống trong 3 tiếng", "Nướng hành, gừng rồi cho vào nồi nước dùng", "Thái mỏng thịt bò", "Trụng bánh phở, xếp thịt và chan nước dùng"]
  },
  {
    id: 2, name: "Gỏi cuốn tôm thịt", category: "Món phụ", level: "Dễ", time: 30, servings: 4, favorite: false,
    ingredients: ["200 g tôm", "200 g thịt ba chỉ", "20 lá bánh tráng", "100 g bún", "1 bó rau sống"],
    steps: ["Luộc tôm và thịt", "Thái thịt mỏng, bóc vỏ tôm", "Cuốn bánh tráng với bún, rau, tôm, thịt", "Pha nước chấm tương đậu"]
  },
  {
    id: 3, name: "Cá kho tộ", category: "Món chính", level: "Trung bình", time: 60, servings: 3, favorite: true,
    ingredients: ["500 g cá basa", "2 muỗng nước mắm", "1 muỗng đường", "3 tép tỏi", "1 quả ớt"],
    steps: ["Ướp cá với nước mắm, đường, tỏi trong 20 phút", "Thắng nước màu", "Cho cá vào kho lửa nhỏ 30 phút"]
  },
  {
    id: 4, name: "Chè đậu xanh", category: "Tráng miệng", level: "Dễ", time: 45, servings: 5, favorite: false,
    ingredients: ["200 g đậu xanh", "150 g đường", "200 ml nước cốt dừa", "1 lá dứa"],
    steps: ["Ngâm đậu 2 tiếng", "Nấu đậu với lá dứa đến khi mềm", "Thêm đường, khuấy đều", "Chan nước cốt dừa khi ăn"]
  },
  {
    id: 5, name: "Trà đào cam sả", category: "Đồ uống", level: "Dễ", time: 15, servings: 2, favorite: false,
    ingredients: ["2 túi trà đen", "4 miếng đào ngâm", "1 quả cam", "2 cây sả", "30 ml siro đào"],
    steps: ["Hãm trà với nước sôi 5 phút", "Đập dập sả, vắt cam", "Cho tất cả vào ly cùng đá và đào"]
  },
  {
    id: 6, name: "Bánh flan", category: "Tráng miệng", level: "Trung bình", time: 50, servings: 6, favorite: false,
    ingredients: ["4 quả trứng", "400 ml sữa tươi", "80 g đường", "1 ống vani"],
    steps: ["Làm caramel đổ vào khuôn", "Đánh trứng với sữa, đường, vani", "Lọc hỗn hợp, đổ vào khuôn", "Hấp lửa nhỏ 25 phút"]
  }
];

var recipes = [];
var editingId = null;      // id món đang sửa (null = đang thêm mới)
var detailRecipe = null;   // món đang xem chi tiết
var detailServings = 1;    // số người ăn đang chọn trong trang chi tiết

// ================== LƯU / ĐỌC LOCALSTORAGE ==================
function loadData() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    recipes = data ? JSON.parse(data) : sampleRecipes;
    if (!Array.isArray(recipes)) recipes = sampleRecipes;
  } catch (e) {
    recipes = sampleRecipes; // dữ liệu hỏng thì dùng dữ liệu mẫu
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

// ================== HÀM TIỆN ÍCH ==================
function $(id) {
  return document.getElementById(id);
}

// Chống chèn mã HTML từ dữ liệu người dùng nhập
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function findRecipe(id) {
  for (var i = 0; i < recipes.length; i++) {
    if (recipes[i].id === id) return recipes[i];
  }
  return null;
}

var toastTimer;
function showToast(message, isError) {
  var toast = $("toast");
  toast.textContent = message;
  toast.className = "toast show" + (isError ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.className = "toast";
  }, 2500);
}

function openModal(id) {
  $(id).classList.remove("hidden");
}

function closeModal(id) {
  $(id).classList.add("hidden");
}

// ================== HIỂN THỊ DANH SÁCH ==================
function getFilteredRecipes() {
  var keyword = $("searchInput").value.trim().toLowerCase();
  var category = $("filterCategory").value;
  var favOnly = $("favOnly").checked;
  var sort = $("sortSelect").value;

  var result = recipes.filter(function (r) {
    var text = (r.name + " " + r.ingredients.join(" ")).toLowerCase();
    if (keyword && text.indexOf(keyword) === -1) return false;
    if (category && r.category !== category) return false;
    if (favOnly && !r.favorite) return false;
    return true;
  });

  result.sort(function (a, b) {
    if (sort === "name") return a.name.localeCompare(b.name, "vi");
    if (sort === "timeAsc") return a.time - b.time;
    if (sort === "timeDesc") return b.time - a.time;
    return b.id - a.id; // mới nhất
  });

  return result;
}

function render() {
  var list = getFilteredRecipes();
  var html = "";

  list.forEach(function (r) {
    html +=
      '<article class="card">' +
        '<div class="card-top">' + (ICONS[r.category] || "🍽️") +
          '<button class="fav-btn" data-action="fav" data-id="' + r.id + '" title="Yêu thích">' +
            (r.favorite ? "❤️" : "🤍") +
          "</button>" +
        "</div>" +
        '<div class="card-body">' +
          "<h3>" + escapeHtml(r.name) + "</h3>" +
          '<span class="badge">' + r.category + "</span>" +
          '<div class="meta">' +
            "<span>⏱ " + r.time + " phút</span>" +
            "<span>👥 " + r.servings + " người</span>" +
            "<span>📊 " + r.level + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="card-actions">' +
          '<button data-action="view" data-id="' + r.id + '">👁 Xem</button>' +
          '<button data-action="edit" data-id="' + r.id + '">✏️ Sửa</button>' +
          '<button class="delete" data-action="delete" data-id="' + r.id + '">🗑 Xóa</button>' +
        "</div>" +
      "</article>";
  });

  $("recipeList").innerHTML = html;
  $("emptyState").classList.toggle("hidden", list.length > 0);
  $("resultCount").textContent = "Hiển thị " + list.length + " / " + recipes.length + " công thức";

  renderStats();
}

function renderStats() {
  var total = recipes.length;
  var fav = 0, sumTime = 0, quick = 0;

  recipes.forEach(function (r) {
    if (r.favorite) fav++;
    if (r.time <= 30) quick++;
    sumTime += r.time;
  });

  $("statTotal").textContent = total;
  $("statFav").textContent = fav;
  $("statAvg").textContent = total ? Math.round(sumTime / total) : 0;
  $("statQuick").textContent = quick;
}

// ================== FORM THÊM / SỬA ==================
function openAddForm() {
  editingId = null;
  $("formTitle").textContent = "Thêm công thức";
  $("recipeForm").reset();
  clearErrors();
  openModal("formModal");
  $("fName").focus();
}

function openEditForm(id) {
  var r = findRecipe(id);
  if (!r) return;

  editingId = id;
  $("formTitle").textContent = "Sửa công thức";
  clearErrors();

  $("fName").value = r.name;
  $("fCategory").value = r.category;
  $("fLevel").value = r.level;
  $("fTime").value = r.time;
  $("fServings").value = r.servings;
  $("fIngredients").value = r.ingredients.join("\n");
  $("fSteps").value = r.steps.join("\n");

  openModal("formModal");
}

// Tách textarea thành mảng, bỏ dòng trống
function toLines(text) {
  return text.split("\n")
    .map(function (line) { return line.trim(); })
    .filter(function (line) { return line !== ""; });
}

function setError(fieldId, errorId, message) {
  $(errorId).textContent = message;
  $(fieldId).classList.toggle("invalid", message !== "");
}

function clearErrors() {
  var fields = [["fName", "errName"], ["fCategory", "errCategory"], ["fTime", "errTime"],
                ["fServings", "errServings"], ["fIngredients", "errIngredients"], ["fSteps", "errSteps"]];
  fields.forEach(function (f) { setError(f[0], f[1], ""); });
}

function validateForm() {
  var ok = true;
  clearErrors();

  var name = $("fName").value.trim();
  var category = $("fCategory").value;
  var time = Number($("fTime").value);
  var servings = Number($("fServings").value);
  var ingredients = toLines($("fIngredients").value);
  var steps = toLines($("fSteps").value);

  // Tên món
  if (name === "") {
    setError("fName", "errName", "Vui lòng nhập tên món."); ok = false;
  } else if (name.length < 2 || name.length > 60) {
    setError("fName", "errName", "Tên món phải từ 2 đến 60 ký tự."); ok = false;
  } else {
    var duplicate = recipes.some(function (r) {
      return r.name.toLowerCase() === name.toLowerCase() && r.id !== editingId;
    });
    if (duplicate) { setError("fName", "errName", "Tên món này đã tồn tại."); ok = false; }
  }

  // Loại món
  if (category === "") {
    setError("fCategory", "errCategory", "Vui lòng chọn loại món."); ok = false;
  }

  // Thời gian
  if (!$("fTime").value || !Number.isInteger(time) || time < 1 || time > 1440) {
    setError("fTime", "errTime", "Thời gian là số nguyên từ 1 đến 1440 phút."); ok = false;
  }

  // Số người ăn
  if (!$("fServings").value || !Number.isInteger(servings) || servings < 1 || servings > 50) {
    setError("fServings", "errServings", "Số người là số nguyên từ 1 đến 50."); ok = false;
  }

  // Nguyên liệu & các bước
  if (ingredients.length === 0) {
    setError("fIngredients", "errIngredients", "Cần ít nhất 1 nguyên liệu."); ok = false;
  }
  if (steps.length === 0) {
    setError("fSteps", "errSteps", "Cần ít nhất 1 bước làm."); ok = false;
  }

  if (!ok) return null;

  return {
    name: name,
    category: category,
    level: $("fLevel").value,
    time: time,
    servings: servings,
    ingredients: ingredients,
    steps: steps
  };
}

function handleSubmit(e) {
  e.preventDefault();
  var data = validateForm();
  if (!data) {
    showToast("Vui lòng kiểm tra lại thông tin!", true);
    return;
  }

  if (editingId === null) {
    data.id = Date.now();
    data.favorite = false;
    recipes.push(data);
    showToast("Đã thêm món \"" + data.name + "\"");
  } else {
    var r = findRecipe(editingId);
    data.id = r.id;
    data.favorite = r.favorite;
    recipes[recipes.indexOf(r)] = data;
    showToast("Đã cập nhật món \"" + data.name + "\"");
  }

  saveData();
  render();
  closeModal("formModal");
}

// ================== XÓA / YÊU THÍCH ==================
function deleteRecipe(id) {
  var r = findRecipe(id);
  if (!r) return;
  if (!confirm("Bạn có chắc muốn xóa món \"" + r.name + "\"?")) return;

  recipes = recipes.filter(function (item) { return item.id !== id; });
  saveData();
  render();
  showToast("Đã xóa món \"" + r.name + "\"");
}

function toggleFavorite(id) {
  var r = findRecipe(id);
  if (!r) return;
  r.favorite = !r.favorite;
  saveData();
  render();
  showToast(r.favorite ? "Đã thêm vào yêu thích ❤️" : "Đã bỏ yêu thích");
}

// ================== XEM CHI TIẾT ==================
// Tính lại số lượng nguyên liệu theo số người ăn.
// VD: "500 g thịt bò" với tỉ lệ 2 => "1000 g thịt bò"
function scaleIngredient(line, ratio) {
  var match = line.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return escapeHtml(line);

  var amount = parseFloat(match[1].replace(",", ".")) * ratio;
  amount = Math.round(amount * 10) / 10;
  return "<b>" + amount + "</b> " + escapeHtml(match[2]);
}

function openDetail(id) {
  detailRecipe = findRecipe(id);
  if (!detailRecipe) return;
  detailServings = detailRecipe.servings;
  renderDetail();
  openModal("detailModal");
}

function renderDetail() {
  var r = detailRecipe;
  var ratio = detailServings / r.servings;

  var ingredientsHtml = r.ingredients.map(function (line) {
    return "<li>" + scaleIngredient(line, ratio) + "</li>";
  }).join("");

  var stepsHtml = r.steps.map(function (step) {
    return "<li>" + escapeHtml(step) + "</li>";
  }).join("");

  $("detailContent").innerHTML =
    '<div class="detail">' +
      '<div class="detail-icon">' + (ICONS[r.category] || "🍽️") + "</div>" +
      '<h2 class="detail-title">' + escapeHtml(r.name) + "</h2>" +
      '<div class="meta detail-meta">' +
        "<span>📂 " + r.category + "</span>" +
        "<span>⏱ " + r.time + " phút</span>" +
        "<span>📊 " + r.level + "</span>" +
      "</div>" +
      '<div class="servings-box">' +
        "<span>👥 Số người ăn:</span>" +
        '<button id="btnMinus">−</button>' +
        "<b>" + detailServings + "</b>" +
        '<button id="btnPlus">+</button>' +
      "</div>" +
      "<h4>🧂 Nguyên liệu</h4>" +
      '<ul class="ingredient-list">' + ingredientsHtml + "</ul>" +
      "<h4>👩‍🍳 Các bước làm</h4>" +
      '<p class="hint">Bấm vào từng bước để đánh dấu đã làm xong.</p>' +
      '<ol class="step-list" id="stepList">' + stepsHtml + "</ol>" +
    "</div>";

  $("btnMinus").onclick = function () {
    if (detailServings > 1) { detailServings--; renderDetail(); }
  };
  $("btnPlus").onclick = function () {
    if (detailServings < 50) { detailServings++; renderDetail(); }
  };
}

// ================== GỢI Ý NGẪU NHIÊN ==================
function randomRecipe() {
  if (recipes.length === 0) {
    showToast("Chưa có công thức nào để gợi ý!", true);
    return;
  }
  var r = recipes[Math.floor(Math.random() * recipes.length)];
  openDetail(r.id);
  showToast("Hôm nay thử nấu: " + r.name + " nhé! 😋");
}

// ================== GẮN SỰ KIỆN ==================
function resetFilters() {
  $("searchInput").value = "";
  $("filterCategory").value = "";
  $("sortSelect").value = "newest";
  $("favOnly").checked = false;
  render();
}

$("btnAdd").addEventListener("click", openAddForm);
$("btnRandom").addEventListener("click", randomRecipe);
$("btnReset").addEventListener("click", resetFilters);
$("recipeForm").addEventListener("submit", handleSubmit);

$("searchInput").addEventListener("input", render);
$("filterCategory").addEventListener("change", render);
$("sortSelect").addEventListener("change", render);
$("favOnly").addEventListener("change", render);

// Các nút trên thẻ món ăn (dùng chung 1 sự kiện)
$("recipeList").addEventListener("click", function (e) {
  var btn = e.target.closest("button");
  if (!btn) return;
  var id = Number(btn.dataset.id);
  var action = btn.dataset.action;

  if (action === "view") openDetail(id);
  if (action === "edit") openEditForm(id);
  if (action === "delete") deleteRecipe(id);
  if (action === "fav") toggleFavorite(id);
});

// Đánh dấu bước đã làm xong
$("detailContent").addEventListener("click", function (e) {
  if (e.target.tagName === "LI" && e.target.parentElement.id === "stepList") {
    e.target.classList.toggle("done");
  }
});

// Đóng modal: nút X, nút Hủy, bấm ra ngoài, phím Esc
document.querySelectorAll(".modal").forEach(function (modal) {
  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.hasAttribute("data-close")) {
      modal.classList.add("hidden");
    }
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal("formModal");
    closeModal("detailModal");
  }
});

// ================== KHỞI ĐỘNG ==================
loadData();
render();
