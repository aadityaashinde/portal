import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.APP_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.APP_CONFIG.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const statusMessage = document.getElementById("status-message");
const logoutBtn = document.getElementById("logout-btn");
const dashboardEmail = document.getElementById("dashboard-email");
const dashboardName = document.getElementById("dashboard-name");
const dashboardProvider = document.getElementById("dashboard-provider");

function showMessage(message, type = "success") {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.classList.remove("hidden");
    statusMessage.style.color = type === "success" ? "#00ff9f" : "#ff4d4f";
}

function redirectToLogin() {
    window.location.href = "/";
}

function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

async function ensurePortalUser(user) {
    const payload = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        auth_provider: user.app_metadata?.provider || "google",
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .schema("portal")
        .from("users")
        .upsert(payload, { onConflict: "id" });

    if (error) {
        console.error("Portal user sync error:", error);
    }
}

async function checkSession() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
            redirectToLogin();
            return;
        }

        const user = data.session.user;

        await ensurePortalUser(user);

        if (dashboardEmail) {
            dashboardEmail.textContent = user.email || "N/A";
        }

        if (dashboardName) {
            dashboardName.textContent =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "Authenticated User";
        }

        if (dashboardProvider) {
            dashboardProvider.textContent = user.app_metadata?.provider || "google";
        }

        initIcons();
    } catch (err) {
        console.error("Dashboard session error:", err);
        redirectToLogin();
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            logoutBtn.disabled = true;

            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error("Logout error:", error);
                showMessage("Failed to disconnect. Please try again.", "error");
                logoutBtn.disabled = false;
                return;
            }

            showMessage("Disconnected successfully. Redirecting...", "success");

            setTimeout(() => {
                redirectToLogin();
            }, 800);
        } catch (err) {
            console.error("Unexpected logout error:", err);
            showMessage("An error occurred. Please try again.", "error");
            logoutBtn.disabled = false;
        }
    });
}

// Handle OAuth callback from Google authentication
async function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");

    if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);

        if (error) {
            console.error("OAuth callback error:", error);
            redirectToLogin();
            return;
        }

        // Remove the code from URL to clean it up
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Handle OAuth callback first, then check session
handleOAuthCallback().then(() => {
    checkSession();
});