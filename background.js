"use strict";

// Cross-browser API
const api = typeof browser !== "undefined" ? browser : chrome;

function createMenus() {
  // Remove and re-create to avoid duplicates across restarts
  try {
    api.contextMenus.removeAll(() => {
      api.contextMenus.create({
        id: "copy-link-text",
        title: "Copy link text",
        contexts: ["link"]
      });
      api.contextMenus.create({
        id: "toggle-copy-mode",
        title: "Toggle Copy Mode",
        contexts: ["all"]
      });
    });
  } catch {
    // Fallback for promise-based removeAll (Firefox)
    api.contextMenus.removeAll?.().finally?.(() => {
      api.contextMenus.create({
        id: "copy-link-text",
        title: "Copy link text",
        contexts: ["link"]
      });
      api.contextMenus.create({
        id: "toggle-copy-mode",
        title: "Toggle Copy Mode",
        contexts: ["all"]
      });
    });
  }
}

api.runtime.onInstalled.addListener(() => {
  createMenus();
});

api.runtime.onStartup?.addListener?.(() => {
  createMenus();
});

// Context menu actions delegate copy to the content script (clipboard is page-bound)
api.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || typeof tab.id !== "number") return;
  if (info.menuItemId === "copy-link-text") {
    api.tabs.sendMessage(tab.id, { type: "CONTEXT_MENU_COPY" });
  } else if (info.menuItemId === "toggle-copy-mode") {
    api.tabs.sendMessage(tab.id, { type: "TOGGLE_COPY_MODE" });
  }
});

// Optional command to toggle copy mode with a hotkey
api.commands?.onCommand?.addListener?.((command) => {
  if (command === "toggle-copy-mode") {
    api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs?.[0];
      if (tab?.id != null) {
        api.tabs.sendMessage(tab.id, { type: "TOGGLE_COPY_MODE" });
      }
    });
  }
});