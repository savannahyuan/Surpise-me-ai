let items = [];
let spinning = false;
let angle = 0;
let spinVelocity = 0;
let targetAngle = 0;

const canvas = document.getElementById("wheelCanvas");
const spinButton = document.getElementById("spinBtn");
const arrow = document.querySelector(".arrow");
const wheelContainer = document.getElementById("wheelContainer");
const generateButton = document.getElementById("generateBtn");

// Hide elements initially
canvas.classList.add("hidden");
spinButton.classList.add("hidden");
arrow.classList.add("hidden");
wheelContainer.classList.add("hidden");

const ctx = canvas.getContext("2d");
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = centerX - 10;

function generateItems() {
  const prompt = document.getElementById("prompt").value;

  fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  })
    .then(res => res.json())
    .then(data => {
      items = data.items;
      angle = 0;

      // Show wheel and controls
      canvas.classList.remove("hidden");
      spinButton.classList.remove("hidden");
      arrow.classList.remove("hidden");
      wheelContainer.classList.remove("hidden");

      // Hide generate button
      generateButton.classList.add("hidden");

      drawWheel();
    });
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!items.length) return;

  const anglePerItem = 2 * Math.PI / items.length;

  items.forEach((item, i) => {
    const startAngle = angle + i * anglePerItem;
    const endAngle = startAngle + anglePerItem;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    // Custom color palette
    const themeColors = [
      '#17324D', // navy
      '#397B89', // teal
      '#C7DDF1', // light blue
      '#F06B67', // salmon
      '#B9372F'  // brick red
    ];
    ctx.fillStyle = themeColors[i % themeColors.length];
    ctx.fill();

    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw label following slice direction
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerItem / 2);
    ctx.translate(radius * 0.65, 0);
    ctx.rotate(Math.PI);
    ctx.scale(-1, -1);

    ctx.fillStyle = "white";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const label = item.length > 30 ? item.slice(0, 27) + "..." : item;
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });
}

function spinWheel() {
  if (spinning || items.length === 0) return;

  const selectedIndex = Math.floor(Math.random() * items.length);
  const anglePerItem = 2 * Math.PI / items.length;
  const stopAngle = 3 * 2 * Math.PI + (Math.PI * 3 / 2) - (selectedIndex * anglePerItem) - anglePerItem / 2;

  targetAngle = stopAngle;
  spinVelocity = (stopAngle - angle) / 60;
  spinning = true;

  animateSpin(selectedIndex);
}

function animateSpin(winningIndex) {
  if (!spinning) return;

  angle += spinVelocity;
  spinVelocity *= 0.98;

  drawWheel();

  if (Math.abs(angle - targetAngle) < 0.01 && Math.abs(spinVelocity) < 0.002) {
    spinning = false;
    angle = targetAngle;
    drawWheel();

    const winner = items[winningIndex];
    document.getElementById("result").textContent = `🎉 Winner: ${winner}`;
  } else {
    requestAnimationFrame(() => animateSpin(winningIndex));
  }
}

spinButton.addEventListener("click", spinWheel);
