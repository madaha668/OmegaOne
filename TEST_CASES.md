# OmegaOne Proxy Manager - Test Cases

This document outlines comprehensive test cases for the OmegaOne Proxy Manager extension.

## Test Environment Setup

### Prerequisites
- Chrome/Brave browser with Developer mode enabled
- Access to test proxy servers (for proxy functionality testing)
- Sample configuration files for import/export testing

### Test Data
Prepare the following test proxy configurations:

```json
{
  "testProxies": [
    {
      "name": "HTTP Test Proxy",
      "protocol": "http",
      "host": "proxy.example.com",
      "port": 8080,
      "username": "testuser",
      "password": "testpass"
    },
    {
      "name": "SOCKS5 Test Proxy",
      "protocol": "socks5",
      "host": "192.168.1.100",
      "port": 1080
    },
    {
      "name": "Local HTTPS Proxy",
      "protocol": "https",
      "host": "localhost",
      "port": 3128
    }
  ]
}
```

## Installation Tests

### TC001: Fresh Installation
**Objective**: Verify extension installs correctly
**Steps**:
1. Navigate to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select OmegaOne directory
5. Verify extension appears in list

**Expected Result**: Extension loads without errors, icon appears in toolbar

### TC002: Permission Verification
**Objective**: Confirm required permissions are granted
**Steps**:
1. After installation, click extension details
2. Review permissions list

**Expected Result**: Shows proxy, storage, activeTab, and downloads permissions

### TC003: Icon Display
**Objective**: Verify extension icon displays correctly
**Steps**:
1. Check extension appears in toolbar
2. Pin extension if not visible
3. Verify icon clarity at different zoom levels

**Expected Result**: Icon displays clearly, matches design specifications

## Core Functionality Tests

### TC004: Initial State
**Objective**: Verify default state on first launch
**Steps**:
1. Click extension icon
2. Observe initial popup state

**Expected Result**: 
- Proxy toggle is OFF
- Status shows "Disabled"
- No proxy nodes in dropdown
- Empty bypass list
- Badge shows no text

### TC005: Add Proxy Node - Valid Data
**Objective**: Test adding a new proxy node with valid information
**Steps**:
1. Click "+" button
2. Fill form with test HTTP proxy data
3. Click "Save"

**Expected Result**: 
- Form closes
- Node appears in dropdown and saved nodes list
- No error messages

### TC006: Add Proxy Node - Invalid Data
**Objective**: Test form validation
**Test Cases**:

**TC006a: Empty Required Fields**
**Steps**:
1. Click "+" button
2. Leave name field empty
3. Click "Save"

**Expected Result**: Form validation prevents submission, shows error message

**TC006b: Invalid Port**
**Steps**:
1. Fill form with port "99999"
2. Click "Save"

**Expected Result**: Port validation error

**TC006c: Invalid Host Format**
**Steps**:
1. Fill form with host "invalid..host"
2. Click "Save"

**Expected Result**: Host validation error or warning

### TC007: Enable Proxy
**Objective**: Test proxy activation
**Steps**:
1. Add a valid proxy node
2. Select node from dropdown
3. Toggle proxy switch to ON

**Expected Result**:
- Status changes to "Enabled"
- Badge shows "ON"
- Selected node becomes active in saved nodes list

### TC008: Disable Proxy
**Objective**: Test proxy deactivation
**Steps**:
1. With proxy enabled, toggle switch to OFF

**Expected Result**:
- Status changes to "Disabled"
- Badge text clears
- No active node in saved nodes list

### TC009: Quick Switch Nodes
**Objective**: Test switching between proxy nodes
**Steps**:
1. Add multiple proxy nodes
2. Enable proxy with first node
3. Select different node from dropdown

**Expected Result**: Active node changes, proxy remains enabled

### TC010: Use Node Button
**Objective**: Test direct node activation
**Steps**:
1. Add proxy node
2. With proxy disabled, click "Use" button on node

**Expected Result**: Proxy enables automatically with selected node

## Bypass List Tests

### TC011: Add Bypass Entries
**Objective**: Test bypass list functionality
**Steps**:
1. Enter test domains in bypass list:
   ```
   example.com
   *.local
   192.168.1.0/24
   ```
2. Click "Save Bypass List"

**Expected Result**: Confirmation message, settings saved

### TC012: Bypass List Validation
**Objective**: Test bypass list with various formats
**Test Data**:
- Domain: `google.com`
- Wildcard: `*.example.com`
- IP: `192.168.1.1`
- CIDR: `10.0.0.0/8`
- Localhost: `localhost`

**Steps**: Enter each format, save, verify acceptance

**Expected Result**: All valid formats accepted

### TC013: Empty Bypass List
**Objective**: Test clearing bypass list
**Steps**:
1. Clear all text from bypass list
2. Save

**Expected Result**: Empty list saved without errors

## Configuration Management Tests

### TC014: Export Configuration
**Objective**: Test configuration export
**Steps**:
1. Add multiple proxy nodes
2. Set bypass list
3. Click "Export Config"

**Expected Result**: JSON file downloads with correct structure and data

### TC015: Import Valid Configuration
**Objective**: Test importing valid configuration
**Steps**:
1. Prepare valid configuration JSON file
2. Click "Import Config"
3. Select file
4. Confirm import

**Expected Result**: Configuration loads, replaces current settings

### TC016: Import Invalid Configuration
**Objective**: Test error handling for invalid imports
**Test Cases**:

**TC016a: Invalid JSON**
**Steps**: Import file with malformed JSON

**Expected Result**: Error message, no changes to current config

**TC016b: Missing Required Fields**
**Steps**: Import JSON missing "nodes" array

**Expected Result**: Error message, current config preserved

**TC016c: Non-JSON File**
**Steps**: Import .txt file

**Expected Result**: Error handling, helpful message

### TC017: Configuration Persistence
**Objective**: Verify settings persist across browser sessions
**Steps**:
1. Add proxy nodes and bypass list
2. Close browser completely
3. Reopen and check extension

**Expected Result**: All settings restored correctly

## Edit and Delete Tests

### TC018: Edit Proxy Node
**Objective**: Test node editing functionality
**Steps**:
1. Add proxy node
2. Click "Edit" button
3. Modify details
4. Save changes

**Expected Result**: Node updates with new information

### TC019: Delete Proxy Node
**Objective**: Test node deletion
**Steps**:
1. Add proxy node
2. Click "Edit" button
3. Click "Delete"
4. Confirm deletion

**Expected Result**: Node removed from all lists

### TC020: Cancel Edit
**Objective**: Test edit cancellation
**Steps**:
1. Start editing node
2. Make changes
3. Click "Cancel"

**Expected Result**: Changes discarded, original data preserved

## Edge Cases and Error Handling

### TC021: Network Error Handling
**Objective**: Test behavior with invalid proxy settings
**Steps**:
1. Add proxy with non-existent host
2. Enable proxy
3. Try browsing

**Expected Result**: Browser shows appropriate proxy connection errors

### TC022: Concurrent Modifications
**Objective**: Test multiple popup windows
**Steps**:
1. Open extension popup
2. Open second popup in new window
3. Make changes in both

**Expected Result**: Changes sync properly, no data corruption

### TC023: Large Configuration
**Objective**: Test performance with many proxy nodes
**Steps**:
1. Import configuration with 50+ proxy nodes
2. Test UI responsiveness

**Expected Result**: UI remains responsive, all features work

### TC024: Special Characters
**Objective**: Test handling of special characters in input
**Test Data**:
- Unicode characters in names
- Special symbols in hostnames
- International domain names

**Steps**: Add nodes with special character data

**Expected Result**: Proper encoding/decoding, no data corruption

## Browser Compatibility Tests

### TC025: Chrome Compatibility
**Objective**: Test on different Chrome versions
**Versions to Test**: Latest stable, one version back
**Expected Result**: Full functionality on all tested versions

### TC026: Brave Compatibility
**Objective**: Test on Brave browser
**Steps**: Install and test all features in Brave
**Expected Result**: Identical functionality to Chrome

### TC027: Different Screen Sizes
**Objective**: Test UI on various screen resolutions
**Test Cases**:
- High DPI displays
- Different zoom levels (50%, 100%, 150%)
- Small laptop screens

**Expected Result**: UI scales properly, all elements accessible

## Performance Tests

### TC028: Startup Performance
**Objective**: Measure extension initialization time
**Steps**:
1. Install extension
2. Measure time from click to popup display

**Expected Result**: Popup opens in <500ms

### TC029: Memory Usage
**Objective**: Monitor extension memory consumption
**Steps**:
1. Use Chrome task manager
2. Monitor background page memory
3. Test with large configurations

**Expected Result**: Reasonable memory usage (<10MB)

### TC030: Proxy Switch Speed
**Objective**: Test responsiveness of proxy switching
**Steps**:
1. Add multiple nodes
2. Time proxy enable/disable operations
3. Time node switching

**Expected Result**: Operations complete in <200ms

## Security Tests

### TC031: Data Storage Security
**Objective**: Verify secure local storage
**Steps**:
1. Add proxy with credentials
2. Inspect browser storage
3. Verify data format

**Expected Result**: Data stored in extension's isolated storage

### TC032: Permission Scope
**Objective**: Verify extension doesn't exceed required permissions
**Steps**:
1. Monitor network requests
2. Check file system access
3. Verify no unexpected API calls

**Expected Result**: Only uses declared permissions

### TC033: XSS Prevention
**Objective**: Test against cross-site scripting
**Steps**:
1. Enter script tags in input fields
2. Import malicious configuration

**Expected Result**: Scripts sanitized, no execution

## Regression Tests

### TC034: Core Workflow
**Objective**: Complete end-to-end testing
**Steps**:
1. Install extension
2. Add proxy node
3. Enable proxy
4. Add bypass list
5. Export configuration
6. Delete node
7. Import configuration
8. Verify everything restored

**Expected Result**: All steps complete successfully

### TC035: Upgrade Testing
**Objective**: Test extension updates
**Steps**:
1. Install previous version (if available)
2. Set up configuration
3. Update to new version
4. Verify data migration

**Expected Result**: Configuration preserved, new features available

## Test Automation Notes

For automated testing, consider:
- Selenium WebDriver for UI automation
- Chrome extension API for programmatic testing
- JSON schema validation for configuration files
- Performance monitoring tools
- Cross-browser testing services

## Test Environment Cleanup

After testing:
1. Clear extension storage
2. Reset proxy settings
3. Remove test configuration files
4. Disable developer mode if needed

## Bug Reporting Template

When reporting issues found during testing:

```
**Bug ID**: TC###-001
**Test Case**: [Test Case Name]
**Severity**: [High/Medium/Low]
**Browser**: [Chrome/Brave version]
**Steps to Reproduce**: 
1. Step one
2. Step two
3. Step three

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshots**: [If applicable]
**Console Errors**: [Any JavaScript errors]
```