// Temporary state to track copy mode and copy URL mode
let state = {
  isCopyModeEnabled: false,
  isCopyUrlEnabled: false,
};

// Create the context menu
browser.contextMenus.create({
  id: "copy-link-text",
  title: "Copy Link Text",
  contexts: ["link"],
});

// Handle the context menu click event
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copy-link-text") {
    // Get the link text
    const linkText = info.linkText || "";

    // Copy to clipboard
    if (linkText) {
      navigator.clipboard
        .writeText(linkText)
        .then(() => {
          console.log("Link text copied to clipboard");

          // Send a message to content.js to show feedback
          browser.tabs
            .sendMessage(tab.id, {
              action: "showCopyFeedback",
              linkText: linkText,
            })
            .catch((err) => {
              console.warn(`Could not send message to tab ${tab.id}:`, err);
            });
        })
        .catch((err) => {
          console.error("Failed to copy link text: ", err);
        });
    }
  }
});

// Handle messages from popup or content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleCopyMode") {
    // Update state based on the message
    state.isCopyModeEnabled = message.isCopyModeEnabled;
    state.isCopyUrlEnabled = message.isCopyUrlEnabled;

    sendResponse({ success: true });
  } else if (message.action === "getCopyModeState") {
    // Respond with the current state
    sendResponse({ ...state });
  }
});

// Reset state when a tab is refreshed
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    state.isCopyModeEnabled = false;
    state.isCopyUrlEnabled = false;

    browser.tabs
      .sendMessage(tabId, {
        action: "resetCopyModeState",
      })
      .catch((err) => {
        console.warn(`Could not send reset state to tab ${tabId}:`, err);
      });
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  state.isCopyModeEnabled = false;
  state.isCopyUrlEnabled = false;
});
