const AUTH_STATUS = {
  INITIALIZING: "initializing",
  READY: "ready",
  ERROR: "error",
};

let authSdk = null;
let authInstance = null;
let authState = {
  status: AUTH_STATUS.INITIALIZING,
  user: null,
  error: null,
  provider: "firebase",
};
let authReadyPromise = null;
const listeners = new Set();

function notifyAuthListeners() {
  const snapshot = getAuthSnapshot();
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error("[NomadSpeak][auth] Listener failed.", error);
    }
  });
}

function setAuthState(nextState = {}) {
  authState = {
    ...authState,
    ...nextState,
  };
  notifyAuthListeners();
}

function getFirebaseConfig() {
  if (window.__NOMADSPEAK_FIREBASE_CONFIG && typeof window.__NOMADSPEAK_FIREBASE_CONFIG === "object") {
    return window.__NOMADSPEAK_FIREBASE_CONFIG;
  }
  if (window.NOMADSPEAK_FIREBASE_CONFIG && typeof window.NOMADSPEAK_FIREBASE_CONFIG === "object") {
    return window.NOMADSPEAK_FIREBASE_CONFIG;
  }
  return null;
}

function toAuthUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    isAnonymous: Boolean(user.isAnonymous),
    emailVerified: Boolean(user.emailVerified),
    providerIds: Array.isArray(user.providerData) ? user.providerData.map((item) => item?.providerId).filter(Boolean) : [],
  };
}

async function loadFirebaseSdk() {
  if (authSdk) return authSdk;
  const [{ initializeApp: initializeFirebaseApp }, authModule] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js"),
  ]);
  authSdk = { initializeFirebaseApp, ...authModule };
  return authSdk;
}

function mapAuthError(error) {
  const code = String(error?.code || "");
  const defaults = {
    code,
    message: "Authentication request failed.",
  };

  if (code === "auth/email-already-in-use") return { ...defaults, message: "This email is already in use." };
  if (code === "auth/invalid-email") return { ...defaults, message: "Please enter a valid email address." };
  if (code === "auth/weak-password") return { ...defaults, message: "Please use a stronger password (at least 6 characters)." };
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return { ...defaults, message: "Invalid email or password." };
  }
  if (code === "auth/too-many-requests") return { ...defaults, message: "Too many attempts. Please try again later." };
  return { ...defaults, message: error?.message || defaults.message };
}

export async function initializeAuth() {
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = (async () => {
    const firebaseConfig = getFirebaseConfig();
    if (!firebaseConfig) {
      setAuthState({
        status: AUTH_STATUS.READY,
        user: null,
        provider: "guest",
        error: null,
      });
      return getAuthSnapshot();
    }

    try {
      const sdk = await loadFirebaseSdk();
      const app = sdk.initializeFirebaseApp(firebaseConfig);
      authInstance = sdk.getAuth(app);
      await sdk.setPersistence(authInstance, sdk.browserLocalPersistence);

      await new Promise((resolve) => {
        sdk.onAuthStateChanged(authInstance, (user) => {
          setAuthState({
            status: AUTH_STATUS.READY,
            user: toAuthUser(user),
            provider: "firebase",
            error: null,
          });
          resolve();
        }, (error) => {
          setAuthState({
            status: AUTH_STATUS.ERROR,
            error: mapAuthError(error),
          });
          resolve();
        });
      });

      return getAuthSnapshot();
    } catch (error) {
      setAuthState({
        status: AUTH_STATUS.ERROR,
        error: mapAuthError(error),
      });
      return getAuthSnapshot();
    }
  })();

  return authReadyPromise;
}

export function subscribeAuthState(listener) {
  if (typeof listener !== "function") return () => {};
  listeners.add(listener);
  listener(getAuthSnapshot());
  return () => listeners.delete(listener);
}

async function ensureAuthInstance() {
  await initializeAuth();
  if (!authInstance) {
    throw new Error("Firebase auth is not configured.");
  }
  return authInstance;
}

export async function signUpWithEmail(email, password) {
  const sdk = await loadFirebaseSdk();
  const auth = await ensureAuthInstance();
  try {
    const credential = await sdk.createUserWithEmailAndPassword(auth, email, password);
    return toAuthUser(credential?.user || null);
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function loginWithEmail(email, password) {
  const sdk = await loadFirebaseSdk();
  const auth = await ensureAuthInstance();
  try {
    const credential = await sdk.signInWithEmailAndPassword(auth, email, password);
    return toAuthUser(credential?.user || null);
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function logoutUser() {
  const sdk = await loadFirebaseSdk();
  const auth = await ensureAuthInstance();
  await sdk.signOut(auth);
}

export function getCurrentUser() {
  return authState.user;
}

export function getAuthSnapshot() {
  return {
    status: authState.status,
    user: authState.user,
    error: authState.error,
    provider: authState.provider,
    isAuthenticated: Boolean(authState.user?.uid),
  };
}
