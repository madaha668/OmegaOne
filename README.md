# OmegaOne Proxy Manager

A powerful Chrome/Brave browser extension for managing proxy configurations with advanced features like node switching, bypass lists, and configuration backup/restore.

## Features

- **Multi-Protocol Support**: HTTP, HTTPS, SOCKS4, and SOCKS5 proxies
- **Quick Proxy Switching**: Instantly switch between saved proxy nodes
- **Bypass Lists**: Define websites/IPs that should bypass the proxy
- **Enable/Disable Toggle**: One-click proxy activation/deactivation
- **Configuration Backup**: Export/import your proxy settings
- **Visual Status Indicator**: Clear indication of proxy status in the browser
- **Secure Storage**: All configurations stored locally in browser

## Installation

### Method 1: Developer Mode (Recommended for testing)

1. **Download/Clone the extension**:
   ```bash
   git clone https://github.com/madaha668/OmegaOne.git
   cd OmegaOne
   ```

2. **Install in Chrome/Brave**:
   - Open Chrome/Brave and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the OmegaOne folder
   - The extension should now appear in your extensions list

3. **Pin the extension**:
   - Click the extensions icon (puzzle piece) in the toolbar
   - Find "OmegaOne Proxy Manager" and click the pin icon

### Method 2: Package as .crx (For distribution)

1. **Package the extension**:
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Pack extension"
   - Select the OmegaOne folder as "Extension root directory"
   - Click "Pack Extension"

2. **Install the .crx file**:
   - Drag and drop the generated .crx file into the Chrome extensions page

## Usage

### Adding Proxy Nodes

1. Click the OmegaOne extension icon in your toolbar
2. Click the "+" button next to the proxy selection dropdown
3. Fill in the proxy details:
   - **Name**: A friendly name for your proxy
   - **Protocol**: Select HTTP, HTTPS, SOCKS4, or SOCKS5
   - **Host**: IP address or domain name of the proxy server
   - **Port**: Port number (1-65535)
   - **Username/Password**: Optional authentication credentials
4. Click "Save"

### Using Proxies

1. **Quick Switch**: Use the dropdown menu to select a proxy node
2. **Toggle Proxy**: Use the switch in the header to enable/disable the proxy
3. **Direct Activation**: Click "Use" button next to any saved proxy node

### Managing Bypass Lists

1. Open the extension popup
2. Scroll to the "Bypass List" section
3. Enter domains, IPs, or IP ranges (one per line):
   ```
   example.com
   192.168.1.0/24
   *.local
   localhost
   ```
4. Click "Save Bypass List"

### Configuration Backup/Restore

**Export Configuration**:
1. Click "Export Config" in the Configuration section
2. A JSON file will be downloaded with your settings

**Import Configuration**:
1. Click "Import Config"
2. Select a previously exported JSON file
3. Confirm to replace current settings

## File Structure

```
OmegaOne/
├── manifest.json          # Extension manifest with permissions
├── popup.html            # Main popup interface
├── popup.css            # Styling for the popup
├── popup.js             # Popup UI logic and interaction
├── background.js        # Service worker for proxy management
├── icons/               # Extension icons
│   ├── icon.svg        # Source SVG icon
│   ├── icon16.png      # 16x16 icon
│   ├── icon32.png      # 32x32 icon
│   ├── icon48.png      # 48x48 icon
│   └── icon128.png     # 128x128 icon
├── create-icons.js      # Helper script for icon generation
├── README.md           # This file
└── TEST_CASES.md       # Test cases documentation
```

## Development

### Building

No build process is required. The extension runs directly from the source files.

### Debugging

1. **Background Script**: 
   - Go to `chrome://extensions/`
   - Find OmegaOne and click "Inspect views: background page"

2. **Popup Script**:
   - Right-click the extension popup
   - Select "Inspect"

3. **Console Logs**:
   - Check browser console for any errors
   - Background script logs appear in the background page inspector

### Testing

See `TEST_CASES.md` for comprehensive testing procedures.

## Permissions

The extension requires the following permissions:

- **proxy**: To manage browser proxy settings
- **storage**: To save proxy configurations locally
- **activeTab**: To interact with the current tab
- **downloads**: To export configuration files
- **host_permissions**: To apply proxy settings to all URLs

## Browser Compatibility

- **Chrome**: Version 88+
- **Brave**: Version 1.20+
- **Edge**: Version 88+ (Chromium-based)
- **Other Chromium browsers**: Should work with Manifest V3 support

## Security Notes

- All proxy configurations are stored locally in the browser
- Passwords are stored in plain text locally (consider this for sensitive environments)
- No data is sent to external servers
- Extension only modifies browser proxy settings, not system settings

## Troubleshooting

### Common Issues

1. **Extension not loading**:
   - Ensure all files are present
   - Check Developer mode is enabled
   - Verify manifest.json syntax

2. **Proxy not working**:
   - Verify proxy server details are correct
   - Check if the proxy server is accessible
   - Ensure bypass list doesn't include the target site

3. **Icons not showing**:
   - Convert SVG to PNG files using the provided instructions
   - Ensure icon files are in the correct `icons/` directory

### Error Messages

- **"Proxy authentication required"**: Add username/password to proxy node
- **"Connection failed"**: Check proxy server availability and credentials
- **"Invalid configuration"**: Verify imported JSON file format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.
