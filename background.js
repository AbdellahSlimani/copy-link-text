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

// One-click toggle via toolbar icon (MV2: browserAction; MV3: action)
if (api.browserAction?.onClicked) {
  api.browserAction.onClicked.addListener((tab) => {
    if (tab?.id != null) {
      api.tabs.sendMessage(tab.id, { type: "TOGGLE_COPY_MODE" });
    }
  });
} else if (api.action?.onClicked) {
  api.action.onClicked.addListener((tab) => {
    if (tab?.id != null) {
      api.tabs.sendMessage(tab.id, { type: "TOGGLE_COPY_MODE" });
    }
  });
}

// Context menu actions delegate copy/toggle to content script
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