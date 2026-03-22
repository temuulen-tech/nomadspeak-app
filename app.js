/**
 * app.js
 * Main bootstrap/controller that starts the existing app flow.
 */

import { mountAppShell } from "./render-shell.js";
import { applyStandardizedButtonLabels } from "./standardized-labels.js";

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
  mountAppShell();
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
