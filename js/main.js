document.addEventListener('DOMContentLoaded', () => {
    // --- Matrix Rain Initialization ---
    const canvas = document.getElementById('matrix-rain');
    const ctx = canvas.getContext('2d');

    let width, height, columns;
    const fontSize = 16;
    let drops = [];

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / fontSize);
        drops = Array(columns).fill(1);
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    setInterval(drawMatrix, 50);

    // --- Mouse Responsiveness ---
    const card = document.getElementById('login-card');
    const cursorGlow = document.getElementById('cursor-glow');

    document.addEventListener('mousemove', (e) => {
        // Cursor Glow
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';

        // Parallax Effect
        const xAxis = (window.innerWidth / 2 - e.clientX) / 25;
        const yAxis = (window.innerHeight / 2 - e.clientY) / 25;
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    // Reset card on mouse leave
    document.addEventListener('mouseleave', () => {
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
    });

    // --- Form Validation & Unlock Logic ---
    const form = document.getElementById('login-form');
    const nameInput = document.getElementById('name');
    const roleSelect = document.getElementById('role');
    const emailInput = document.getElementById('email');
    const googleBtn = document.getElementById('google-signin');
    const statusMsg = document.getElementById('status-message');

    function validateForm() {
        const isNameValid = nameInput.value.trim().length > 0;
        const isRoleValid = roleSelect.value !== "";
        const isEmailValid = emailInput.checkValidity() && emailInput.value.includes('@');

        if (isNameValid && isRoleValid && isEmailValid) {
            googleBtn.disabled = false;
            googleBtn.classList.remove('disabled');
        } else {
            googleBtn.disabled = true;
            googleBtn.classList.add('disabled');
        }
    }

    [nameInput, roleSelect, emailInput].forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });

    // Handle Google Sign-in Click
    googleBtn.addEventListener('click', () => {
        if (googleBtn.disabled) return;

        // Visual feedback
        googleBtn.innerHTML = '<span class="btn-text">DECODING ACCESS...</span>';
        googleBtn.style.background = '#00ff41';
        googleBtn.querySelector('.btn-text').style.color = '#000';

        setTimeout(() => {
            statusMsg.textContent = "ACCESS GRANTED. WELCOME TO THE CONSTRUCT, " + nameInput.value.toUpperCase();
            statusMsg.classList.remove('hidden');
            statusMsg.classList.add('success');
            
            // Revert button (optional simulation)
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }, 1500);
    });
});
