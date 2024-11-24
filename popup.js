// Keep track of whether the copy mode is enabled
let isCopyModeEnabled = false;

document.getElementById("toggleButton").addEventListener("click", function () {
  const button = document.getElementById("toggleButton");
  const statusSpan = document.getElementById("status");

  // Toggle the copy mode state
  isCopyModeEnabled = !isCopyModeEnabled;

  // Update the UI based on the current state
  if (isCopyModeEnabled) {
    statusSpan.textContent = "Enabled";
    button.textContent = "Disable Copy Link Text";
  } else {
    statusSpan.textContent = "Disabled";
    button.textContent = "Enable Copy Link Text";
  }

  // Send a message to the content script to toggle picker mode
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.tabs.sendMessage(tabs[0].id, { action: "toggleCopyMode" });
  });
});
