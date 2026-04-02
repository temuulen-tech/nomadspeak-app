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

function formatDebugValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${Math.round(value * 100) / 100}`;
  }
  if (value == null || value === "") return "n/a";
  return String(value);
}

function mountAndroidWidthDebugOverlay() {
  if (!shouldShowAndroidWidthDebugOverlay()) return;
  if (document.getElementById("android-width-debug-overlay")) return;

  const overlay = document.createElement("pre");
  overlay.id = "android-width-debug-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.position = "fixed";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "0";
  overlay.style.zIndex = "2147483647";
  overlay.style.margin = "0";
  overlay.style.padding = "8px 10px";
  overlay.style.maxHeight = "45vh";
  overlay.style.overflow = "auto";
  overlay.style.boxSizing = "border-box";
  overlay.style.background = "rgba(0, 0, 0, 0.88)";
  overlay.style.borderTop = "1px solid rgba(141, 255, 154, 0.5)";
  overlay.style.color = "#d5ffd5";
  overlay.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  overlay.style.fontSize = "10px";
  overlay.style.lineHeight = "1.3";
  overlay.style.whiteSpace = "pre-wrap";
  overlay.style.overflowWrap = "anywhere";
  overlay.style.pointerEvents = "none";

  const render = () => {
    const viewport = window.visualViewport;
    const appRootWidth = document.getElementById("app-root")?.getBoundingClientRect?.().width;
    const appWidth = document.querySelector(".app")?.getBoundingClientRect?.().width;
    const homeShellWidth = document.getElementById("home-shell")?.getBoundingClientRect?.().width;
    const viewportMetaContent = document
      .querySelector('meta[name="viewport"]')
      ?.getAttribute("content");

    const lines = [
      "[Android Runtime Width Debug]",
      `window.innerWidth: ${formatDebugValue(window.innerWidth)}`,
      `window.outerWidth: ${formatDebugValue(window.outerWidth)}`,
      `window.devicePixelRatio: ${formatDebugValue(window.devicePixelRatio)}`,
      `window.visualViewport?.width: ${formatDebugValue(viewport?.width)}`,
      `window.visualViewport?.height: ${formatDebugValue(viewport?.height)}`,
      `window.visualViewport?.scale: ${formatDebugValue(viewport?.scale)}`,
      `document.documentElement.clientWidth: ${formatDebugValue(document.documentElement?.clientWidth)}`,
      `document.body.clientWidth: ${formatDebugValue(document.body?.clientWidth)}`,
      `#app-root getBoundingClientRect().width: ${formatDebugValue(appRootWidth)}`,
      `.app getBoundingClientRect().width: ${formatDebugValue(appWidth)}`,
      `#home-shell getBoundingClientRect().width: ${formatDebugValue(homeShellWidth)}`,
      `meta[name="viewport"] content: ${formatDebugValue(viewportMetaContent)}`,
    ];

    overlay.textContent = lines.join("\n");
  };

  document.body.appendChild(overlay);
  render();
  window.addEventListener("resize", render, { passive: true });
  window.addEventListener("orientationchange", render, { passive: true });
  window.visualViewport?.addEventListener("resize", render, { passive: true });
  window.visualViewport?.addEventListener("scroll", render, { passive: true });
  window.setInterval(render, 700);
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
  mountLearningTopActions();
  applyStandardizedButtonLabels();
  updateViewportHeightVars();
  mountAndroidWidthDebugOverlay();

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
    window.addEventListener("resize", updateViewportHeightVars, { passive: true });
    window.visualViewport?.addEventListener("resize", updateViewportHeightVars, { passive: true });
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
