/**
 * app.js
 * Main bootstrap/controller that starts the existing app flow.
 */

import { mountAppShell } from "./render-shell.js";
import { mountLearningTopActions } from "./shared-ui/learning-top-actions.js";
import { applyStandardizedButtonLabels } from "./standardized-labels.js";

function shouldBypassServiceWorker() {
  const searchParams = new URLSearchParams(window.location.search);
  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local");
  const isSecureContext = window.location.protocol === "https:";
  return searchParams.get("sw") === "off" || isLocalHost || !isSecureContext;
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
  const shellEl = document.querySelector(".phone-preview-shell");
  if (!shellEl) return true;
  if (shellEl.querySelector(".app")) return true;

  const currentUrl = new URL(window.location.href);
  const alreadyRecovered = currentUrl.searchParams.get("boot-recover") === "1";
  if (alreadyRecovered) return false;

  currentUrl.searchParams.set("sw", "off");
  currentUrl.searchParams.set("boot-recover", "1");
  window.location.replace(currentUrl.toString());
  return false;
}

function updateViewportHeightVars() {
  const docEl = document.documentElement;
  if (!docEl) return;

  const visualViewportHeight = window.visualViewport?.height;
  const safeHeight = Number.isFinite(visualViewportHeight) && visualViewportHeight > 0
    ? visualViewportHeight
    : window.innerHeight;

  docEl.style.setProperty("--app-viewport-height", `${safeHeight}px`);
  docEl.style.setProperty("--app-viewport-offset-top", `${window.visualViewport?.offsetTop || 0}px`);
}

async function bootstrapApp() {
  document.documentElement.dataset.appBoot = "mounting";
  await unregisterServiceWorkersForDebug();
  if (!ensureShellMountPoint()) {
    document.documentElement.dataset.appBoot = "recovering";
    return;
  }
  mountAppShell();
  mountLearningTopActions();
  applyStandardizedButtonLabels();
  updateViewportHeightVars();

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
