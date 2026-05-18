# Metaphor IO - Chrome Extension

Cross-AI context bridge for seamless conversation transfer between ChatGPT and Claude.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` directory

## Usage

### Exporting Context

1. Open a conversation in ChatGPT or Claude
2. Click the "Export to Metaphor IO" button that appears in the header
3. Your conversation context will be extracted and saved

### Importing Context

1. Click the Metaphor IO extension icon in your browser toolbar
2. Click "Import to Current Tab" (while on Claude or ChatGPT)
3. The formatted context will be pasted into the input field
4. Press Enter to send and continue your conversation

## Features

- ✅ One-click context extraction from ChatGPT and Claude
- ✅ Automatic structuring into 5-part format (intent, facts, decisions, questions, tone)
- ✅ Platform-specific formatting for optimal context transfer
- ✅ Local storage for quick access
- ✅ API sync with Metaphor IO dashboard (when logged in)

## Development

The extension uses Manifest V3 and consists of:

- **Content Scripts**: Inject export buttons and handle message extraction
- **Background Service Worker**: Process contexts and communicate with API
- **Popup**: Quick access to last context and import functionality

## Permissions

- `activeTab`: Access current tab to detect platform
- `storage`: Store last exported context locally
- `clipboardWrite`: Copy formatted context to clipboard
- `host_permissions`: Access ChatGPT and Claude domains
