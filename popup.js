// Track whether the copy mode is enabled
let isCopyModeEnabled = false;

// Get the button and status elements once
const toggleButton = document.getElementById("toggleButton");
const statusSpan = document.getElementById("status");

// Function to update the UI based on the copy mode state
const updateUI = () => {
  if (isCopyModeEnabled) {
    statusSpan.textContent = "Enabled";
    toggleButton.textContent = "Disable Copy Link Text";
  } else {
    statusSpan.textContent = "Disabled";
    toggleButton.textContent = "Enable Copy Link Text";
  }
};

// Function to handle the toggle action
const handleToggleClick = () => {
  // Toggle the copy mode state
  isCopyModeEnabled = !isCopyModeEnabled;

  // Update the UI
  updateUI();

  // Send a message to the active tab to toggle the picker mode
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { action: "toggleCopyMode" });
  });
};

// Add click event listener to the toggle button
toggleButton.addEventListener("click", handleToggleClick);
