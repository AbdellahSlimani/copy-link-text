// Get elements
const toggleButton = document.getElementById("toggleButton");
const statusSpan = document.getElementById("status");
const body = document.body; // For dark mode
const copyrightYear = document.getElementById("copyrightYear");

// Update UI based on the current state
const updateUI = ({ isCopyModeEnabled }) => {
  statusSpan.textContent = isCopyModeEnabled ? "Enabled" : "Disabled";
  toggleButton.textContent = isCopyModeEnabled
    ? "Disable Copy Link Text"
    : "Enable Copy Link Text";
};

// Toggle the copy mode and update the state
const handleToggleClick = async () => {
  const currentState = await getState();
  const isCopyModeEnabled = !currentState.isCopyModeEnabled;

  // Update global state via background script
  chrome.runtime.sendMessage(
    {
      action: "toggleCopyMode",
      isCopyModeEnabled,
    },
    (response) => {
      if (response.success) {
        updateUI({ isCopyModeEnabled });

        // Send a message to the active tab for visual updates
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          browser.tabs.sendMessage(tabs[0].id, {
            action: "toggleCopyMode",
            isCopyModeEnabled,
          });
        });
      }
    }
  );
};

// Fetch the current state from the background script
const getState = () => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "getCopyModeState" }, (response) => {
      resolve(response);
    });
  });
};

// Initialize dark mode
const initializeDarkMode = () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }

  // Listen for changes in system theme preference
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (e.matches) {
        body.classList.add("dark-mode");
      } else {
        body.classList.remove("dark-mode");
      }
    });
};

// Initialize the popup
document.addEventListener("DOMContentLoaded", async () => {
  const currentYear = new Date().getFullYear();

  // Update the copyright year
  copyrightYear.textContent = currentYear;
  // Fetch and update the UI with the current state
  const state = await getState();
  updateUI(state);

  // Add event listeners
  toggleButton.addEventListener("click", handleToggleClick);

  // Initialize dark mode
  initializeDarkMode();
});
