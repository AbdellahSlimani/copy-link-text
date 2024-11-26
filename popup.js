// Track whether the copy mode is enabled
let isCopyModeEnabled = false;

// Get the button and status elements once
const toggleButton = document.getElementById("toggleButton");
const statusSpan = document.getElementById("status");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Dark Mode Elements
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

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

// Add event listeners
toggleButton.addEventListener("click", handleToggleClick);

// Initialize dark mode
const initializeDarkMode = () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }

  // Listen for changes in system theme preference
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (e.matches) {
      body.classList.add("dark-mode");
    } else {
      body.classList.remove("dark-mode");
    }
  });
};

// Call initializeDarkMode after DOM is ready
document.addEventListener("DOMContentLoaded", initializeDarkMode);
