/**
 * app.js
 * Main bootstrap/controller that starts the existing app flow.
 */

import { mountAppShell } from "./render-shell.js";
import { mountLearningTopActions } from "./shared-ui/learning-top-actions.js";
import { applyStandardizedButtonLabels } from "./standardized-labels.js";

function isLocalLikeHost(host = window.location.hostname) {
  if (!host) return false;
  const normalizedHost = host.trim().toLowerCase();
  if (["localhost", "127.0.0.1", "::1"].includes(normalizedHost) || normalizedHost.endsWith(".local")) {
    return true;
  }
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalizedHost)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(normalizedHost)) return true;
  const privateRange172 = normalizedHost.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (privateRange172) {
    const secondOctet = Number(privateRange172[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }
  return false;
}

function isRealMobileBrowser() {
  const ua = navigator.userAgent || "";
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
  const touchPoints = Number(navigator.maxTouchPoints || 0);
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) && (coarsePointer || touchPoints > 1);
}

function shouldUseDirectMobileBoot() {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("mobileBoot") === "off") return false;
  if (searchParams.get("mobileBoot") === "direct") return true;
  return isRealMobileBrowser() && isLocalLikeHost();
}

function shouldShowAndroidWidthDebugOverlay() {
  const ua = navigator.userAgent || "";
  return /Android/i.test(ua);
}

function shouldApplyAndroidEmergencyFullWidthFix() {
  const ua = navigator.userAgent || "";
  return /Android/i.test(ua);
}

function forceInlineEmergencyWidthStyles(element, displayMode = "block") {
  if (!element) return;
  const style = element.style;
  style.setProperty("width", "100vw", "important");
  style.setProperty("min-width", "100vw", "important");
  style.setProperty("max-width", "100vw", "important");
  style.setProperty("margin", "0", "important");
  style.setProperty("left", "auto", "important");
  style.setProperty("right", "auto", "important");
  style.setProperty("transform", "none", "important");
  style.setProperty("zoom", "1", "important");
  style.setProperty("display", displayMode, "important");
  style.setProperty("align-items", "stretch", "important");
  style.setProperty("min-height", "100dvh", "important");
}

function applyAndroidEmergencyFullWidthFix() {
  if (!shouldApplyAndroidEmergencyFullWidthFix()) return;

  forceInlineEmergencyWidthStyles(document.documentElement, "block");
  forceInlineEmergencyWidthStyles(document.body, "flex");
  document.body.style.setProperty("justify-content", "flex-start", "important");

  const styled = new Set();
  const selectorDisplayPairs = [
    ["#app-root", "block"],
    [".app", "block"],
    ["#home-shell", "block"],
    ["#start-screen", "flex"],
  ];

  selectorDisplayPairs.forEach(([selector, displayMode]) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (styled.has(element)) return;
      styled.add(element);
      forceInlineEmergencyWidthStyles(element, displayMode);
    });
  });
}

function formatPx(value) {
  if (!Number.isFinite(value)) return "n/a";
  return `${Math.round(value * 100) / 100}px`;
}

function describeElementWidth(selector, element) {
  if (!element) {
    return `${selector}
  missing: true`;
  }

  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  return `${selector}
  offsetWidth: ${formatPx(element.offsetWidth)}
  clientWidth: ${formatPx(element.clientWidth)}
  rect.width: ${formatPx(rect.width)}
  display: ${styles.display}
  position: ${styles.position}
  margin-left/right: ${styles.marginLeft} / ${styles.marginRight}
  max-width: ${styles.maxWidth}
  width: ${styles.width}`;
}

function mountAndroidWidthDebugOverlay() {
  if (!shouldShowAndroidWidthDebugOverlay()) return;
  if (document.getElementById("android-width-debug-overlay")) return;

  const overlay = document.createElement("pre");
  overlay.id = "android-width-debug-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.maxWidth = "none";
  overlay.style.overflow = "auto";
  overlay.style.margin = "0";
  overlay.style.padding = "4px";
  overlay.style.background = "rgba(0,0,0,0.92)";
  overlay.style.color = "#fff";
  overlay.style.textShadow = "0 0 1px rgba(141,255,154,0.85)";
  overlay.style.border = "1px solid rgba(141,255,154,0.35)";
  overlay.style.fontSize = "8px";
  overlay.style.lineHeight = "1.1";
  overlay.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  overlay.style.zIndex = "2147483647";
  overlay.style.whiteSpace = "pre-wrap";
  overlay.style.overflowWrap = "anywhere";
  overlay.style.clip = "auto";
  overlay.style.clipPath = "none";
  overlay.style.boxSizing = "border-box";
  overlay.style.pointerEvents = "none";

  const updateOverlay = () => {
    const viewport = window.visualViewport;
    const viewportMetaContent = document
      .querySelector('meta[name="viewport"]')
      ?.getAttribute("content");
    const lines = [
      "[Android Width Debug Overlay]",
      `time: ${new Date().toISOString()}`,
      `window.innerWidth: ${formatPx(window.innerWidth)}`,
      `window.outerWidth: ${window.outerWidth}`,
      `window.devicePixelRatio: ${window.devicePixelRatio}`,
      `window.visualViewport.width: ${formatPx(viewport?.width ?? Number.NaN)}`,
      `window.visualViewport.height: ${formatPx(viewport?.height ?? Number.NaN)}`,
      `window.visualViewport.scale: ${viewport?.scale}`,
      `document.documentElement.clientWidth: ${formatPx(document.documentElement?.clientWidth ?? Number.NaN)}`,
      `document.body.clientWidth: ${formatPx(document.body?.clientWidth ?? Number.NaN)}`,
      `#app-root width: ${formatPx(document.getElementById("app-root")?.getBoundingClientRect?.().width ?? Number.NaN)}`,
      `.app width: ${formatPx(document.querySelector(".app")?.getBoundingClientRect?.().width ?? Number.NaN)}`,
      `#home-shell width: ${formatPx(document.getElementById("home-shell")?.getBoundingClientRect?.().width ?? Number.NaN)}`,
      `meta viewport content: ${viewportMetaContent || "n/a"}`,
      "",
      describeElementWidth("#app-root", document.getElementById("app-root")),
      "",
      describeElementWidth(".app", document.querySelector(".app")),
      "",
      describeElementWidth("#home-shell", document.getElementById("home-shell")),
      "",
      describeElementWidth("#start-screen", document.getElementById("start-screen")),
    ];
    overlay.textContent = lines.join("\n");
  };

  document.body.appendChild(overlay);
  updateOverlay();
  window.addEventListener("resize", updateOverlay, { passive: true });
  window.addEventListener("orientationchange", updateOverlay, { passive: true });
  window.visualViewport?.addEventListener("resize", updateOverlay, { passive: true });
  window.visualViewport?.addEventListener("scroll", updateOverlay, { passive: true });
  window.setInterval(updateOverlay, 700);
}

function logAndroidViewportDebugValues(reason = "unknown") {
  if (!shouldShowAndroidWidthDebugOverlay()) return;

  const visualViewport = window.visualViewport;
  const appRootWidth = document.getElementById("app-root")?.getBoundingClientRect?.().width;
  const appWidth = document.querySelector(".app")?.getBoundingClientRect?.().width;
  const homeShellWidth = document.getElementById("home-shell")?.getBoundingClientRect?.().width;
  const viewportMetaContent = document
    .querySelector('meta[name="viewport"]')
    ?.getAttribute("content");

  console.log("[ANDROID_VIEWPORT_DEBUG]", {
    reason,
    timestamp: new Date().toISOString(),
    "window.innerWidth": window.innerWidth,
    "window.outerWidth": window.outerWidth,
    "window.devicePixelRatio": window.devicePixelRatio,
    "window.visualViewport?.width": visualViewport?.width,
    "window.visualViewport?.height": visualViewport?.height,
    "window.visualViewport?.scale": visualViewport?.scale,
    "document.documentElement.clientWidth": document.documentElement?.clientWidth,
    "document.body.clientWidth": document.body?.clientWidth,
    "#app-root getBoundingClientRect().width": appRootWidth,
    ".app getBoundingClientRect().width": appWidth,
    "#home-shell getBoundingClientRect().width": homeShellWidth,
    "meta[name=\"viewport\"] content": viewportMetaContent,
  });
}

function shouldBypassServiceWorker() {
  const searchParams = new URLSearchParams(window.location.search);
  const isSecureContext = window.location.protocol === "https:";
  return searchParams.get("sw") === "off" || isLocalLikeHost() || !isSecureContext;
}

async function unregisterServiceWorkersForDebug() {
  if (!("serviceWorker" in navigator)) return;
  if (!shouldBypassServiceWorker()) return;
  if (typeof navigator.serviceWorker.getRegistrations !== "function") return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch (_) {
    // Keep bootstrap resilient: stale worker cleanup is best effort.
  }
}

function ensureShellMountPoint() {
  const existingRoot = document.querySelector(".app");
  if (existingRoot) {
    existingRoot.id = existingRoot.id || "app-root";
    return existingRoot;
  }

  const root = document.createElement("div");
  root.className = "app";
  root.id = "app-root";

  const startNodes = [
    document.getElementById("home-shell"),
    document.getElementById("quiz-screen"),
    document.getElementById("sentence-screen"),
    document.getElementById("sentence-game-screen"),
    document.getElementById("qa-game-screen"),
    document.getElementById("screen-shell-aux"),
  ].filter(Boolean);

  startNodes.forEach((node) => root.appendChild(node));
  document.body.appendChild(root);
  return root;
}

function ensureOverlayMountPoint() {
  let overlayShell = document.getElementById("overlay-shell");
  if (overlayShell) return overlayShell;
  overlayShell = document.createElement("div");
  overlayShell.id = "overlay-shell";
  document.body.appendChild(overlayShell);
  return overlayShell;
}

function ensureBootFallbackContent(root) {
  if (!root) return;
  const hasHomeShell = Boolean(root.querySelector("#home-shell"));
  if (hasHomeShell) return;
  root.innerHTML = '<section id="home-shell"></section><section class="home-only home-hub-card" id="start-screen"></section>';
}

function updateViewportHeightVars() {
  const docEl = document.documentElement;
  if (!docEl) return;

  const visualViewportHeight = window.visualViewport?.height;
  const safeHeight = Number.isFinite(visualViewportHeight) && visualViewportHeight > 0
    ? visualViewportHeight
    : window.innerHeight;
  const visualViewportWidth = window.visualViewport?.width;
  const safeWidth = Number.isFinite(visualViewportWidth) && visualViewportWidth > 0
    ? visualViewportWidth
    : window.innerWidth;

  docEl.style.setProperty("--app-viewport-height", `${safeHeight}px`);
  docEl.style.setProperty("--app-viewport-width", `${safeWidth}px`);
  docEl.style.setProperty("--app-viewport-offset-top", `${window.visualViewport?.offsetTop || 0}px`);

  applyAndroidEmergencyFullWidthFix();
}


function ensureViewportMeta() {
  const viewportContent = "width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no";
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = document.createElement("meta");
    viewportMeta.setAttribute("name", "viewport");
    document.head.prepend(viewportMeta);
  }
  if (viewportMeta.getAttribute("content") !== viewportContent) {
    viewportMeta.setAttribute("content", viewportContent);
  }
}
async function bootstrapApp() {
  document.documentElement.dataset.appBoot = "mounting";
  ensureViewportMeta();
  await unregisterServiceWorkersForDebug();
  const root = ensureShellMountPoint();
  if (root && shouldUseDirectMobileBoot()) {
    document.documentElement.dataset.bootMode = "direct-mobile";
  }
  ensureOverlayMountPoint();
  ensureBootFallbackContent(root);
  mountAppShell();
  applyAndroidEmergencyFullWidthFix();
  mountLearningTopActions();
  applyStandardizedButtonLabels();
  updateViewportHeightVars();
  mountAndroidWidthDebugOverlay();
  logAndroidViewportDebugValues("startup");

  const { initializeAuth } = await import("./auth.js");
  await initializeAuth();

  const { initializeApp } = await import("./script.js");
  initializeApp();

  document.documentElement.dataset.appBoot = "ready";
}

function queueBootstrap() {
  const start = () => {
    window.removeEventListener("resize", updateViewportHeightVars);
    window.visualViewport?.removeEventListener("resize", updateViewportHeightVars);
    window.visualViewport?.removeEventListener("scroll", updateViewportHeightVars);

    updateViewportHeightVars();
    logAndroidViewportDebugValues("startup-before-bootstrap");
    window.addEventListener("resize", updateViewportHeightVars, { passive: true });
    window.addEventListener("resize", () => logAndroidViewportDebugValues("window-resize"), { passive: true });
    window.visualViewport?.addEventListener("resize", updateViewportHeightVars, { passive: true });
    window.visualViewport?.addEventListener("resize", () => logAndroidViewportDebugValues("visualViewport-resize"), { passive: true });
    window.visualViewport?.addEventListener("scroll", updateViewportHeightVars, { passive: true });

    bootstrapApp().catch((error) => {
      document.documentElement.dataset.appBoot = "error";
      console.error("[NomadSpeak] App bootstrap failed.", error);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
    return;
  }

  start();
}

queueBootstrap();
