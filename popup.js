"use strict";

const api = typeof browser !== "undefined" ? browser : chrome;

// Elements
const toggleButton = document.getElementById("toggleButton");
const statusEl = document.getElementById("status");
const copyright =
  document.getElementById("copyrightYear");

// Helpers
function setStatus(text) {
  if (statusEl) statusEl.textContent = text || "";
}

function updateButtonLabel(isOn) {
  toggleButton.textContent = isOn ? "Disable Copy Mode" : "Enable Copy Mode";
  setStatus(isOn ? "Copy Mode is ON for this tab." : "Copy Mode is OFF.");
}

function withActiveTab(fn) {
  api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];
    if (tab?.id != null) {
      fn(tab.id);
    } else {
      setStatus("Not available on this page.");
    }
  });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  if (copyright) copyright.textContent = String(year);

  // Query current state from content script
  withActiveTab((tabId) => {
    api.tabs.sendMessage(tabId, { type: "GET_STATE" }, (resp) => {
      if (api.runtime.lastError) {
        setStatus("This page does not allow extensions.");
        updateButtonLabel(false);
        return;
      }
      const isOn = Boolean(resp?.isCopyModeOn);
      updateButtonLabel(isOn);
    });
  });

  toggleButton.addEventListener("click", () => {
    withActiveTab((tabId) => {
      api.tabs.sendMessage(tabId, { type: "TOGGLE_COPY_MODE" }, (resp) => {
        const isOn = Boolean(resp?.isCopyModeOn);
        updateButtonLabel(isOn);
      });
    });
  });
});