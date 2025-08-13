class ProxyManager {
  constructor() {
    this.isEnabled = false;
    this.currentNode = null;
    this.bypassList = [];
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupListeners();
  }

  setupListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true;
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        this.handleStorageChange(changes);
      }
    });
  }

  async handleMessage(message, sendResponse) {
    try {
      switch (message.action) {
        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'toggleProxy':
          const result = await this.toggleProxy(message.enabled, message.nodeIndex);
          sendResponse({ success: true, data: result });
          break;

        case 'switchNode':
          const switchResult = await this.switchNode(message.nodeIndex);
          sendResponse({ success: true, data: switchResult });
          break;

        case 'saveBypassList':
          await this.saveBypassList(message.bypassList);
          sendResponse({ success: true });
          break;

        case 'saveNodes':
          await this.saveNodes(message.nodes);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async loadSettings() {
    const data = await chrome.storage.local.get(['proxyNodes', 'bypassList', 'isEnabled', 'currentNodeIndex']);
    
    this.nodes = data.proxyNodes || [];
    this.bypassList = data.bypassList || [];
    this.isEnabled = data.isEnabled || false;
    this.currentNodeIndex = data.currentNodeIndex || -1;

    if (this.isEnabled && this.currentNodeIndex >= 0 && this.nodes[this.currentNodeIndex]) {
      await this.applyProxySettings(this.nodes[this.currentNodeIndex]);
    }
  }

  async getSettings() {
    return {
      nodes: this.nodes,
      bypassList: this.bypassList,
      isEnabled: this.isEnabled,
      currentNodeIndex: this.currentNodeIndex
    };
  }

  async toggleProxy(enabled, nodeIndex = -1) {
    this.isEnabled = enabled;

    if (enabled && nodeIndex >= 0 && this.nodes[nodeIndex]) {
      this.currentNodeIndex = nodeIndex;
      await this.applyProxySettings(this.nodes[nodeIndex]);
    } else {
      await this.clearProxySettings();
      this.currentNodeIndex = -1;
    }

    await chrome.storage.local.set({
      isEnabled: this.isEnabled,
      currentNodeIndex: this.currentNodeIndex
    });

    this.updateBadge();
    return { isEnabled: this.isEnabled, currentNodeIndex: this.currentNodeIndex };
  }

  async switchNode(nodeIndex) {
    if (nodeIndex >= 0 && this.nodes[nodeIndex]) {
      this.currentNodeIndex = nodeIndex;
      
      if (this.isEnabled) {
        await this.applyProxySettings(this.nodes[nodeIndex]);
      }

      await chrome.storage.local.set({ currentNodeIndex: this.currentNodeIndex });
      this.updateBadge();
      
      return { currentNodeIndex: this.currentNodeIndex };
    }
    throw new Error('Invalid node index');
  }

  async applyProxySettings(node) {
    const config = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: node.protocol,
          host: node.host,
          port: parseInt(node.port)
        },
        bypassList: this.bypassList
      }
    };

    await chrome.proxy.settings.set({
      value: config,
      scope: 'regular'
    });

    console.log('Proxy applied:', node.name);
  }

  async clearProxySettings() {
    await chrome.proxy.settings.clear({ scope: 'regular' });
    console.log('Proxy cleared');
  }

  async saveBypassList(bypassList) {
    this.bypassList = bypassList;
    await chrome.storage.local.set({ bypassList: this.bypassList });

    if (this.isEnabled && this.currentNodeIndex >= 0) {
      await this.applyProxySettings(this.nodes[this.currentNodeIndex]);
    }
  }

  async saveNodes(nodes) {
    this.nodes = nodes;
    await chrome.storage.local.set({ proxyNodes: this.nodes });

    if (this.currentNodeIndex >= this.nodes.length) {
      this.currentNodeIndex = -1;
      await chrome.storage.local.set({ currentNodeIndex: this.currentNodeIndex });
    }
  }

  updateBadge() {
    const text = this.isEnabled ? 'ON' : '';
    const color = this.isEnabled ? '#4CAF50' : '#757575';
    
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  }

  async handleStorageChange(changes) {
    if (changes.proxyNodes) {
      this.nodes = changes.proxyNodes.newValue || [];
    }
    if (changes.bypassList) {
      this.bypassList = changes.bypassList.newValue || [];
    }
  }
}

const proxyManager = new ProxyManager();