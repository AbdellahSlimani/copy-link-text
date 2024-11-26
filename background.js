// Create the context menu
browser.contextMenus.create({
  id: "copy-link-text",
  title: "Copy Link Text",
  contexts: ["link"]
});

// Handle the click event
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copy-link-text") {
    // Get the link text
    const linkText = info.linkText || "";

    // Copy to clipboard
    if (linkText) {
      navigator.clipboard.writeText(linkText)
        .then(() => {
          console.log("Link text copied to clipboard");

          // Send a message to content.js to show feedback
          browser.tabs.sendMessage(tab.id, {
            action: "showCopyFeedback",  // Action type
            linkText: linkText          // Text to display in the feedback
          });
        })
        .catch(err => {
          console.error("Failed to copy link text: ", err);
        });
    }
  }
});
