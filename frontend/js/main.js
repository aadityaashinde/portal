import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const APP_CONFIG = {
  SUPABASE_URL: "https://tjgqrhkhijponodsosya.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ3FyaGtoaWpwb25vZHNvc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzA3MTMsImV4cCI6MjA5MTkwNjcxM30.32dX7FSDCkktPsSsxFbXdlXQKgXOhOhsHTE6Xv3kkdA",
  API_BASE_URL: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://api.thegenalphalabs.com"
};

const SUPABASE_URL = APP_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = APP_CONFIG.SUPABASE_ANON_KEY;
const API_BASE_URL = APP_CONFIG.API_BASE_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Matrix Rain Animation
const canvas = document.getElementById("matrix-rain");
const ctx = canvas.getContext("2d");

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Matrix characters
const characters =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const charArray = characters.split("");

const fontSize = 14;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function resetMatrix() {
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
}

window.addEventListener("resize", () => {
    resizeCanvas();
    resetMatrix();
});

// Draw matrix rain
function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff41";
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
const cursorGlow = document.getElementById("cursor-glow");
document.addEventListener("mousemove", (e) => {
    if (cursorGlow) {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    }
});

// Parallax effect for login card
const loginCard = document.getElementById("login-card");
document.addEventListener("mousemove", (e) => {
    if (!loginCard) return;

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
const submitButtonText = submitButton?.querySelector(".btn-text");

function showMessage(message, type = "success") {
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.classList.remove("hidden");
    statusMessage.style.color = type === "success" ? "#00ff9f" : "#ff4d4f";
}

function validateForm() {
    if (!nameInput || !roleInput || !emailInput || !submitButton) return;

    const name = nameInput.value.trim();
    const role = roleInput.value.trim();
    const email = emailInput.value.trim();
    const isValid = Boolean(name && role && email);

    submitButton.disabled = !isValid;
    submitButton.classList.toggle("disabled", !isValid);
}

[nameInput, roleInput, emailInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", validateForm);
    input.addEventListener("change", validateForm);
});

validateForm();

// If already signed in, send user straight to dashboard
async function checkSessionAndRedirect() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("Session check error:", error);
            return;
        }

        if (data?.session) {
            window.location.href = "/dashboard";
        }
    } catch (err) {
        console.error("Unexpected session check error:", err);
    }
}

checkSessionAndRedirect();

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = nameInput?.value.trim() || "";
        const role = roleInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";

        if (!name || !role || !email) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (submitButton) submitButton.disabled = true;
        if (submitButtonText) submitButtonText.textContent = "PROCESSING...";

        try {
            // Step 1: Keep your current backend registration
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    role,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                showMessage(data.detail || "Failed to save user.", "error");
                return;
            }

            showMessage(
                `User saved. Redirecting to Google sign-in for ${data.name || name}...`,
                "success"
            );

            // Step 2: Start Google OAuth
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin + "/dashboard/",
                },
            });

            if (oauthError) {
                console.error("Google OAuth error:", oauthError);
                showMessage(oauthError.message || "Google sign-in failed.", "error");
                return;
            }
        } catch (error) {
            console.error("Submission error:", error);
            showMessage("Server connection failed.", "error");
        } finally {
            // Note: if OAuth succeeds, browser redirects before this matters much.
            if (submitButton) submitButton.disabled = false;
            if (submitButtonText) {
                submitButtonText.textContent = "SIGN IN WITH GOOGLE";
            }
        }
    });
}