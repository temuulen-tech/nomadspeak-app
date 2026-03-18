/**
 * app.js
 * Main bootstrap/controller that starts the existing app flow.
 */

import { mountAppShell } from "./render-shell.js";

mountAppShell();

const { initializeApp } = await import("./script.js");

initializeApp();
