let isPickerModeOn = false;
let floatingIconElement = null;

// Listen for messages from the background or popup to toggle picker mode
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleCopyMode") {
    isPickerModeOn = !isPickerModeOn;

    // Select all <a> tags on the page
    const links = document.querySelectorAll("a");

    if (isPickerModeOn) {
      // Disable all links
      links.forEach((link) => {
        link.addEventListener("click", preventLinkAction);
      });

      // Show the floating indicator (icon128.png)
      showFloatingIcon();
    } else {
      // Re-enable links
      links.forEach((link) => {
        link.removeEventListener("click", preventLinkAction);
        link.style.pointerEvents = "auto";
      });

      // Remove the floating indicator
      removeFloatingIcon();
    }
  }
});

// Function to prevent the default link action and copy the link text
function preventLinkAction(event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  // Copy the text of the link (not the href)
  const linkText = event.currentTarget.innerText;

  // Use the Clipboard API to copy the text
  navigator.clipboard
    .writeText(linkText)
    .then(() => {
      console.log(`Link text copied to clipboard: ${linkText}`);
      // Optionally show some feedback (e.g., a notification)
      showCopyFeedback(linkText);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
}

// Optional: Show a small feedback message to the user
function showCopyFeedback(linkText) {
  const feedbackElement = document.createElement("div");
  feedbackElement.textContent = `Copied: ${linkText}`;
  feedbackElement.style.position = "fixed";
  feedbackElement.style.bottom = "20px";
  feedbackElement.style.left = "50%";
  feedbackElement.style.transform = "translateX(-50%)";
  feedbackElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  feedbackElement.style.color = "white";
  feedbackElement.style.padding = "10px";
  feedbackElement.style.borderRadius = "5px";
  feedbackElement.style.fontSize = "14px";
  document.body.appendChild(feedbackElement);

  // Remove feedback after 2 seconds
  setTimeout(() => {
    feedbackElement.remove();
  }, 2000);
}

// Listen for the message from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showCopyFeedback") {
    showCopyFeedback(message.linkText);
  }
});

// Function to show the floating indicator in the bottom-left corner
function showFloatingIcon() {
  if (!floatingIconElement) {
    floatingIconElement = document.createElement("img");
    floatingIconElement.src = browser.runtime.getURL("icons/icon128.png"); // Use icon128.png
    floatingIconElement.style.position = "fixed";
    floatingIconElement.style.bottom = "20px";
    floatingIconElement.style.left = "20px";
    floatingIconElement.style.zIndex = "9999";
    floatingIconElement.style.width = "50px"; // Adjust size if needed
    floatingIconElement.style.height = "50px"; // Adjust size if needed
    floatingIconElement.style.cursor = "pointer"; // Make it look clickable
    floatingIconElement.title = "Click to disable picker mode"; // Add tooltip
    document.body.appendChild(floatingIconElement);

    // Add a click event listener to disable picker mode when clicked
    floatingIconElement.addEventListener("click", () => {
      disablePickerMode();
    });
  }
}

// Function to remove the floating indicator
function removeFloatingIcon() {
  if (floatingIconElement) {
    floatingIconElement.remove();
    floatingIconElement = null;
  }
}

// Function to disable picker mode
function disablePickerMode() {
  isPickerModeOn = false;

  // Re-enable all links
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    link.removeEventListener("click", preventLinkAction);
    link.style.pointerEvents = "auto";
  });

  // Remove the floating indicator
  removeFloatingIcon();
}
