"use strict";

// Cross-browser API
const api = typeof browser !== "undefined" ? browser : chrome;

let isCopyModeOn = false;
let floatingIconElement = null;
let lastContextData = { text: "", ts: 0 };

// Heuristic to extract visible link text
function getLinkText(target) {
  const a = target?.closest?.("a");
  if (!a) return "";
  let text = (a.innerText || "").trim();

  if (!text) {
    const img = a.querySelector("img");
    if (img?.alt) text = img.alt.trim();
  }
  if (!text) {
    const aria = a.getAttribute("aria-label");
    if (aria) text = aria.trim();
  }
  if (!text) {
    const title = a.getAttribute("title");
    if (title) text = title.trim();
  }
  if (!text && a.href) {
    try {
      const u = new URL(a.href);
      const last = u.pathname.split("/").filter(Boolean).pop();
      text = (last || u.hostname || u.href).trim();
    } catch {
      text = a.href.trim();
    }
  }
  return text;
}

// Clipboard helpers
function copyText(text) {
  if (!text) return Promise.resolve(false);
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "-1000px";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  ta.remove();
  return Promise.resolve(ok);
}

// Generic toast (no "Copied:" prefix)
function showToast(message) {
  const feedbackElement = document.createElement("div");
  feedbackElement.textContent = message;
  feedbackElement.style.position = "fixed";
  feedbackElement.style.left = "50%";
  feedbackElement.style.transform = "translateX(-50%)";
  feedbackElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  feedbackElement.style.color = "white";
  feedbackElement.style.padding = "10px";
  feedbackElement.style.borderRadius = "6px";
  feedbackElement.style.fontSize = "14px";
  feedbackElement.style.zIndex = "2147483647";
  feedbackElement.style.pointerEvents = "none";

  const existing = document.querySelectorAll(".copy-feedback");
  const offset = existing.length * 45;
  feedbackElement.style.bottom = `${20 + offset}px`;

  feedbackElement.className = "copy-feedback";
  document.body.appendChild(feedbackElement);

  setTimeout(() => feedbackElement.remove(), 1600);
}

// Copy toast (WITH "Copied:" prefix)
function showCopyToast(text) {
  if (!text) return;
  showToast(`Copied: ${text}`);
}

// Copy handler (used by both Copy Mode and Alt+Click)
function handleCopyFromLink(a, event) {
  const linkText = getLinkText(a);
  if (!linkText) return;
  event?.preventDefault?.();
  event?.stopImmediatePropagation?.();
  copyText(linkText)
    .then(() => showCopyToast(linkText)) // keep "Copied:" prefix here
    .catch(() => {});
}

// Copy Mode toggle
function setCopyMode(on) {
  const next = !!on;
  const changed = next !== isCopyModeOn;
  isCopyModeOn = next;

  if (isCopyModeOn) {
    showFloatingIcon();
  } else {
    removeFloatingIcon();
  }

  // Toggle toasts should NOT include the "Copied:" prefix
  if (changed) {
    showToast(isCopyModeOn ? "Copy Mode enabled" : "Copy Mode disabled");
  }
}

// Alt+Click quick-copy and Copy Mode click interception (event delegation)
document.addEventListener(
  "click",
  (event) => {
    const a = event.target?.closest?.("a");
    if (!a) return;

    // Skip form inputs / editable areas
    const active = document.activeElement;
    const isEditing =
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable);

    // Copy if Copy Mode ON, or if user Alt+Clicked (desktop quick action)
    if (!isEditing && (isCopyModeOn || event.altKey)) {
      handleCopyFromLink(a, event);
    }
  },
  true // capture to beat site handlers when in Copy Mode
);

// Capture last right-clicked link text for the context menu action (cross-browser)
document.addEventListener(
  "contextmenu",
  (event) => {
    const text = getLinkText(event.target);
    if (text) {
      lastContextData = { text, ts: Date.now() };
    }
  },
  true
);

// Floating indicator in bottom-left corner to exit Copy Mode
function showFloatingIcon() {
  if (floatingIconElement) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Disable Copy Mode");
  btn.title = "Click to disable Copy Mode";

  // Positioning and sizing (mobile-friendly 44–48px tap target)
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.left = "20px";
  btn.style.width = "44px";
  btn.style.height = "44px";
  btn.style.borderRadius = "22px";
  btn.style.border = "none";
  btn.style.padding = "0";
  btn.style.cursor = "pointer";
  btn.style.zIndex = "2147483647";
  btn.style.display = "inline-block";
  btn.style.overflow = "hidden";
  btn.style.backgroundColor = "transparent";

  // Brand background (extension icon), slightly dimmed for X readability
  btn.style.backgroundImage = `url(${api.runtime.getURL("icons/icon128.png")})`;
  btn.style.backgroundSize = "cover";
  btn.style.backgroundPosition = "center";
  btn.style.backgroundRepeat = "no-repeat";
  btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.30)";
  btn.style.filter = "brightness(0.9) saturate(0.9)";

  // Overlay X (transparent black), centered
  const x = document.createElement("span");
  x.textContent = "✕";
  x.style.position = "absolute";
  x.style.inset = "0";
  x.style.display = "flex";
  x.style.alignItems = "center";
  x.style.justifyContent = "center";
  x.style.fontSize = "20px";
  x.style.fontWeight = "700";
  x.style.color = "rgba(0,0,0,0.72)";
  x.style.textShadow = "0 0 2px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.35)";

  btn.appendChild(x);

  // Click/keyboard to disable — setCopyMode will show a non-"Copied:" toast
  btn.tabIndex = 0;
  btn.addEventListener("click", () => {
    setCopyMode(false);
  });
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setCopyMode(false);
    }
  });

  document.body.appendChild(btn);
  floatingIconElement = btn;
}

function removeFloatingIcon() {
  if (floatingIconElement) {
    floatingIconElement.remove();
    floatingIconElement = null;
  }
}

// Messaging from popup/background
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message?.type) {
    case "TOGGLE_COPY_MODE": {
      setCopyMode(!isCopyModeOn);
      sendResponse?.({ ok: true, isCopyModeOn });
      return; // synchronous response
    }
    case "GET_STATE": {
      sendResponse?.({ isCopyModeOn });
      return;
    }
    case "CONTEXT_MENU_COPY": {
      const now = Date.now();
      if (now - lastContextData.ts < 5000 && lastContextData.text) {
        copyText(lastContextData.text)
          .then(() => showCopyToast(lastContextData.text)) // keep "Copied:" prefix here
          .catch(() => {});
      } else {
        // Non-copy message: no "Copied:" prefix
        showToast("No link text detected");
      }
      sendResponse?.({ ok: true });
      return;
    }
  }
});