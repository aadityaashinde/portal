// Matrix Rain Animation
const canvas = document.getElementById('matrix-rain');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix characters
const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charArray = characters.split('');

const fontSize = 14;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

// Draw matrix rain
function drawMatrix() {
    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff41';
    ctx.font = `${fontSize}px JetBrains Mono`;

    for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

// Cursor glow effect
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// Parallax effect for login card
const loginCard = document.getElementById('login-card');
const parallaxContainer = document.getElementById('parallax-container');

document.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    loginCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Form elements
const loginForm = document.querySelector("#login-form");
const nameInput = document.querySelector("#name");
const roleInput = document.querySelector("#role");
const emailInput = document.querySelector("#email");
const statusMessage = document.querySelector("#status-message");
const submitButton = document.querySelector("#google-signin");

function validateForm() {
    const name = nameInput.value.trim();
    const role = roleInput.value.trim();
    const email = emailInput.value.trim();
    const isValid = name && role && email;

    submitButton.disabled = !isValid;
    submitButton.classList.toggle("disabled", !isValid);
}

[nameInput, roleInput, emailInput].forEach(input => {
    input.addEventListener("input", validateForm);
    input.addEventListener("change", validateForm);
});

validateForm();

function showMessage(message, type = "success") {
    statusMessage.textContent = message;
    statusMessage.classList.remove("hidden");
    statusMessage.style.color = type === "success" ? "#00ff9f" : "#ff4d4f";
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const role = roleInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !role || !email) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.querySelector(".btn-text").textContent = "PROCESSING...";

    try {
        const response = await fetch("/api/v1/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                role
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.detail || "Failed to save user.", "error");
            return;
        }

        showMessage(`Access granted. User saved: ${data.name}`, "success");
        loginForm.reset();
    } catch (error) {
        console.error(error);
        showMessage("Server connection failed.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.querySelector(".btn-text").textContent = "SIGN IN WITH GOOGLE";
    }
});