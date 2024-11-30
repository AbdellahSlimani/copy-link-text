// Get elements
const copyrightYear = document.getElementById("copyrightYear");
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Function to handle the toggle action
const handleToggleClick = () => {

  // Send a message to the active tab to toggle the picker mode
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { action: "toggleCopyMode" });
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

  // Add event listeners
  toggleButton.addEventListener("click", handleToggleClick);

  // Initialize dark mode
  initializeDarkMode();
});
