const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const itemTextarea = document.getElementById("itemTextarea");
const addButton = document.getElementById("addButton");
const choicesList = document.querySelector(".choices-list ul");

const colors = [
  "#f39c12",
  "#e67e22",
  "#1abc9c",
  "#2ecc71",
  "#9b59b6",
  "#3498db",
  "#f1c40f",
  "#e74c3c",
];

let segments = [];
let isSpinning = false;
let currentRotation = 0;

function loadLastResult() {
  const lastResult = localStorage.getItem("lastResult");
  if (lastResult) {
    const resultElement = document.getElementById("result");
    resultElement.textContent = `Làm đi: ${lastResult}`;
  }
}

loadLastResult(); // Gọi hàm này khi trang được tải

// Hàm vẽ vòng quay
// Hàm vẽ vòng quay với nhiều màu sắc
function renderWheel() {
  if (segments.length === 0) return;

  const size = canvas.width;
  const radius = size / 2;
  let elements = [];
  for (const segment of segments) {
    if (!segment.disabled) elements.push(segment);
  }

  if (elements.length === 0) return;
  const segmentAngle = (2 * Math.PI) / elements.length;

  for (let i = 0; i < elements.length; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    // Chọn màu từ mảng colors (lặp lại khi hết mảng)
    const color = colors[i % colors.length];

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#ecf0f1";
    ctx.stroke();
    ctx.closePath();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#2c3e50";
    ctx.font = "16px Arial";
    ctx.fillText(elements[i].text, radius - 10, 5);
    ctx.restore();
  }
}

// Hàm render danh sách lựa chọn
function renderChoices() {
  choicesList.innerHTML = "";
  segments.forEach((choice, index) => {
    const li = document.createElement("li");
    if (choice.disabled) {
      li.classList.add("disabled");
    }

    // Tạo switch
    const switchLabel = document.createElement("label");
    switchLabel.className = "switch";

    const switchInput = document.createElement("input");
    switchInput.type = "checkbox";
    switchInput.checked = !choice.disabled;
    switchInput.addEventListener("change", () => toggleChoice(index));

    const slider = document.createElement("span");
    slider.className = "slider";

    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(slider);

    // Nội dung lựa chọn
    const choiceText = document.createElement("span");
    choiceText.textContent = choice.text;

    // Nút xóa
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Xóa";
    deleteButton.className = "delete-button";
    deleteButton.addEventListener("click", () => deleteChoice(index));

    li.appendChild(switchLabel);
    li.appendChild(choiceText);
    li.appendChild(deleteButton);

    choicesList.appendChild(li);
  });
}

function toggleChoice(index) {
  segments[index].disabled = !segments[index].disabled;
  saveChoicesToLocalStorage();
  renderChoices();
  renderWheel();
}

// Hàm lưu danh sách vào LocalStorage
function saveChoicesToLocalStorage() {
  localStorage.setItem("choices", JSON.stringify(segments));
}

// Hàm tải danh sách từ LocalStorage
function loadChoicesFromLocalStorage() {
  const storedChoices = localStorage.getItem("choices");
  if (storedChoices) {
    segments = JSON.parse(storedChoices);
    renderChoices();
    renderWheel();
  }
}

// Khi thêm lựa chọn
addButton.addEventListener("click", () => {
  const input = itemTextarea.value.trim();
  if (!input) {
    alert("Vui lòng nhập ít nhất một lựa chọn!");
    return;
  }

  const newChoices = input
    .split("\n")
    .filter((choice) => choice.trim() !== "")
    .map((choice) => ({ text: choice, disabled: false }));
  segments.push(...newChoices);
  itemTextarea.value = "";
  renderChoices();
  renderWheel();
  saveChoicesToLocalStorage(); // Lưu vào LocalStorage
});

// Khi xóa một lựa chọn
function deleteChoice(index) {
  segments.splice(index, 1);
  renderChoices();
  renderWheel();
  saveChoicesToLocalStorage(); // Lưu lại sau khi xóa
}

function startCountdown() {
  const countdownElement = document.getElementById("countdown");
  const lastSpinTime = parseInt(localStorage.getItem("lastSpinTime"), 10);
  const currentTime = Date.now();

  if (lastSpinTime && currentTime - lastSpinTime < 360000) {
    const interval = setInterval(() => {
      const remainingTime = 3600000 - (Date.now() - lastSpinTime);

      if (remainingTime <= 0) {
        clearInterval(interval);
        countdownElement.textContent = ""; // Xóa đồng hồ khi hết thời gian
        spinButton.disabled = false; // Kích hoạt nút quay
      } else {
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        countdownElement.textContent = `Bạn có thể quay lại sau: ${minutes} phút ${seconds} giây`;
        spinButton.disabled = true; // Vô hiệu hóa nút quay
      }
    }, 1000);
  } else {
    countdownElement.textContent = ""; // Không hiện nếu không có thời gian chờ
    spinButton.disabled = false; // Kích hoạt nút quay
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const shuffleButton = document.getElementById("shuffleButton");

shuffleButton.addEventListener("click", () => {
  if (segments.length === 0) {
    alert("Danh sách trống, không thể xáo trộn!");
    return;
  }

  shuffleArray(segments); // Xáo trộn mảng
  renderChoices(); // Cập nhật danh sách hiển thị
  renderWheel(); // Cập nhật vòng quay
  saveChoicesToLocalStorage(); // Lưu danh sách xáo trộn vào LocalStorage
});

document.addEventListener("DOMContentLoaded", () => {
  startCountdown(); // Khởi động đếm ngược khi tải trang
});

// Khi nhấn nút quay
spinButton.addEventListener("click", () => {
  const lastSpinTime = parseInt(localStorage.getItem("lastSpinTime"), 10);
  const currentTime = Date.now();

  if (lastSpinTime && currentTime - lastSpinTime < 360000) {
    return; // Không cho phép quay nếu chưa đủ 1 giờ
  }

  // Lưu thời gian quay
  localStorage.setItem("lastSpinTime", currentTime);
  startCountdown(); // Khởi động đếm ngược

  if (isSpinning || segments.length === 0) {
    alert("Hãy thêm ít nhất một lựa chọn để quay!");
    return;
  }

  isSpinning = true;

  const randomSpin = Math.floor(3600 + Math.random() * 360); // Quay ít nhất 10 vòng
  currentRotation += randomSpin;

  const duration = 3000; // Thời gian quay 3 giây
  const start = performance.now();

  function animateWheel(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);

    const angle = currentRotation * easeOut;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    renderWheel();
    ctx.restore();

    if (progress < 1) {
      requestAnimationFrame(animateWheel);
    } else {
      let elements = [];
      for (const segment of segments) {
        if (!segment.disabled) elements.push(segment);
      }
      const segmentAngle = 360 / elements.length; // Góc của mỗi phần tử
      const finalAngle = currentRotation % 360; // Góc cuối cùng của vòng quay
      const correctedAngle = (360 - finalAngle) % 360; // Điều chỉnh để khớp mũi tên
      const selectedIndex =
        Math.floor(correctedAngle / segmentAngle) % elements.length;

      // Cập nhật kết quả vào thẻ <p>
      const resultElement = document.getElementById("result");

      // Hiển thị kết quả với hiệu ứng
      resultElement.textContent = `Làm đi: ${elements[selectedIndex].text}`;
      resultElement.classList.add("show");

      // Lưu kết quả vào LocalStorage
      localStorage.setItem("lastResult", elements[selectedIndex].text);

      // Xóa lớp `show` sau 0.5 giây để trở về trạng thái bình thường
      setTimeout(() => {
        resultElement.classList.remove("show");
      }, 500);

      isSpinning = false;
    }
  }

  requestAnimationFrame(animateWheel);
});

// Tải danh sách khi trang mở
loadChoicesFromLocalStorage();
