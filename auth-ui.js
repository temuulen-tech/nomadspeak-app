import {
  getAuthSnapshot,
  loginWithEmail,
  logoutUser,
  signUpWithEmail,
  subscribeAuthState,
} from "./auth.js";

function setText(element, text) {
  if (element) element.textContent = text;
}

function setHidden(element, hidden) {
  if (!element) return;
  element.classList.toggle("hidden", Boolean(hidden));
}

function normalizeCredentials(formData) {
  return {
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || "").trim(),
  };
}

export function initializeAuthUi({
  statusEl,
  providerEl,
  userEmailEl,
  authErrorEl,
  loginFormEl,
  signupFormEl,
  logoutBtn,
  guestHintEl,
} = {}) {
  const loginSubmitBtn = loginFormEl?.querySelector("button[type='submit']") || null;
  const signupSubmitBtn = signupFormEl?.querySelector("button[type='submit']") || null;

  function render(snapshot = getAuthSnapshot()) {
    const hasUser = Boolean(snapshot.user?.uid);
    const isGuestAuth = snapshot.provider === "guest";
    const statusLabel = snapshot.status === "initializing"
      ? "Checking account session..."
      : hasUser
        ? "Signed in"
        : isGuestAuth
          ? "Guest mode"
          : "Signed out";

    setText(statusEl, statusLabel);
    setText(providerEl, isGuestAuth ? "Provider: guest fallback" : "Provider: Firebase Auth");
    setText(userEmailEl, hasUser ? snapshot.user.email || "(no email)" : "—");
    setText(authErrorEl, snapshot.error?.message || "");
    setHidden(authErrorEl, !snapshot.error);

    const disabledForGuest = isGuestAuth;
    if (loginSubmitBtn) loginSubmitBtn.disabled = disabledForGuest;
    if (signupSubmitBtn) signupSubmitBtn.disabled = disabledForGuest;
    if (logoutBtn) logoutBtn.disabled = !hasUser;

    setHidden(guestHintEl, !isGuestAuth);
  }

  async function onLoginSubmit(event) {
    event.preventDefault();
    const { email, password } = normalizeCredentials(new FormData(loginFormEl));
    if (!email || !password) {
      setText(authErrorEl, "Email and password are required.");
      setHidden(authErrorEl, false);
      return;
    }
    setText(authErrorEl, "");
    setHidden(authErrorEl, true);
    try {
      await loginWithEmail(email, password);
      loginFormEl.reset();
    } catch (error) {
      setText(authErrorEl, error?.message || "Unable to sign in.");
      setHidden(authErrorEl, false);
    }
  }

  async function onSignupSubmit(event) {
    event.preventDefault();
    const { email, password } = normalizeCredentials(new FormData(signupFormEl));
    if (!email || !password) {
      setText(authErrorEl, "Email and password are required.");
      setHidden(authErrorEl, false);
      return;
    }
    setText(authErrorEl, "");
    setHidden(authErrorEl, true);
    try {
      await signUpWithEmail(email, password);
      signupFormEl.reset();
    } catch (error) {
      setText(authErrorEl, error?.message || "Unable to create account.");
      setHidden(authErrorEl, false);
    }
  }

  async function onLogoutClick() {
    setText(authErrorEl, "");
    setHidden(authErrorEl, true);
    try {
      await logoutUser();
    } catch (error) {
      setText(authErrorEl, error?.message || "Unable to sign out.");
      setHidden(authErrorEl, false);
    }
  }

  loginFormEl?.addEventListener("submit", onLoginSubmit);
  signupFormEl?.addEventListener("submit", onSignupSubmit);
  logoutBtn?.addEventListener("click", onLogoutClick);

  const unsubscribe = subscribeAuthState((snapshot) => render(snapshot));
  render();

  return () => {
    unsubscribe();
    loginFormEl?.removeEventListener("submit", onLoginSubmit);
    signupFormEl?.removeEventListener("submit", onSignupSubmit);
    logoutBtn?.removeEventListener("click", onLogoutClick);
  };
}
