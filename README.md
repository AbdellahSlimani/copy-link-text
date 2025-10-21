# Copy Link Text

Copy the visible text of hyperlinks with a tap/click. Cross‑browser, lightweight, and privacy‑friendly.

## Key Features

- Mobile-first: Tap links in Copy Mode to copy their text (works great on Firefox Mobile and other browsers).
- Alt+Click on desktop: Quickly copy link text without enabling Copy Mode.
- Context menu: Right-click a link and choose “Copy link text”.
- No tracking, no ads. Open source.

## How It Works

1. Enable Copy Mode from the popup (or via the context menu on Desktop).
2. Click/tap any link to copy its visible text.
3. Disable Copy Mode using the floating ✕ button or the popup.
4. Desktop tip: Hold Alt and click a link to copy instantly with no mode switching.


## Permissions

- contextMenus: Provide the “Copy link text” context menu.
- clipboardWrite: Allow copying to the clipboard.
- activeTab / scripting: Communicate with the active tab.
- storage: Reserved for future settings (e.g., defaults).

## Privacy

- No data collection, no analytics.

## Development

- Load the extension as an unpacked extension (Developer Mode) in your browser.
- Files:
  - `manifest.json`: MV2 manifest (cross-browser).
  - `background.js`: Service worker for menus and commands.
  - `content.js`: Page logic (Copy Mode, Alt+Click, toasts).
  - `popup.html`, `popup.js`, `popup.css`: Action popup.

## License

MIT. Add a LICENSE file with the MIT text.