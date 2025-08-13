class PopupController {
  constructor() {
    this.nodes = [];
    this.bypassList = [];
    this.isEnabled = false;
    this.currentNodeIndex = -1;
    this.isEditing = false;
    this.editIndex = -1;

    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadSettings() {
    try {
      const response = await this.sendMessage({ action: 'getSettings' });
      if (response.success) {
        const { nodes, bypassList, isEnabled, currentNodeIndex } = response.data;
        this.nodes = nodes || [];
        this.bypassList = bypassList || [];
        this.isEnabled = isEnabled || false;
        this.currentNodeIndex = currentNodeIndex || -1;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  setupEventListeners() {
    document.getElementById('proxy-toggle').addEventListener('change', (e) => {
      this.toggleProxy(e.target.checked);
    });

    document.getElementById('proxy-select').addEventListener('change', (e) => {
      const nodeIndex = parseInt(e.target.value);
      if (!isNaN(nodeIndex) && nodeIndex >= 0) {
        this.switchNode(nodeIndex);
      }
    });

    document.getElementById('add-node-btn').addEventListener('click', () => {
      this.showNodeForm();
    });

    document.getElementById('node-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveNode();
    });

    document.getElementById('cancel-node').addEventListener('click', () => {
      this.hideNodeForm();
    });

    document.getElementById('delete-node').addEventListener('click', () => {
      this.deleteNode();
    });

    document.getElementById('save-bypass').addEventListener('click', () => {
      this.saveBypassList();
    });

    document.getElementById('export-config').addEventListener('click', () => {
      this.exportConfig();
    });

    document.getElementById('import-config').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
      this.importConfig(e.target.files[0]);
    });
  }

  updateUI() {
    this.updateStatus();
    this.updateNodeSelect();
    this.updateSavedNodes();
    this.updateBypassList();
  }

  updateStatus() {
    const toggle = document.getElementById('proxy-toggle');
    const statusText = document.getElementById('status-text');
    
    toggle.checked = this.isEnabled;
    statusText.textContent = this.isEnabled ? 'Enabled' : 'Disabled';
    statusText.className = this.isEnabled ? 'status-enabled' : 'status-disabled';
  }

  updateNodeSelect() {
    const select = document.getElementById('proxy-select');
    select.innerHTML = '<option value="">Select Proxy Node</option>';

    this.nodes.forEach((node, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${node.name} (${node.protocol}://${node.host}:${node.port})`;
      if (index === this.currentNodeIndex) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  updateSavedNodes() {
    const container = document.getElementById('saved-nodes');
    container.innerHTML = '';

    this.nodes.forEach((node, index) => {
      const nodeElement = document.createElement('div');
      nodeElement.className = 'node-item';
      if (index === this.currentNodeIndex && this.isEnabled) {
        nodeElement.classList.add('active');
      }

      nodeElement.innerHTML = `
        <div class="node-info">
          <div class="node-name">${node.name}</div>
          <div class="node-details">${node.protocol}://${node.host}:${node.port}</div>
        </div>
        <div class="node-actions">
          <button class="btn btn-small btn-edit" data-index="${index}">Edit</button>
          <button class="btn btn-small btn-use" data-index="${index}">Use</button>
        </div>
      `;

      container.appendChild(nodeElement);
    });

    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-edit')) {
        const index = parseInt(e.target.dataset.index);
        this.editNode(index);
      } else if (e.target.classList.contains('btn-use')) {
        const index = parseInt(e.target.dataset.index);
        this.useNode(index);
      }
    });
  }

  updateBypassList() {
    const textarea = document.getElementById('bypass-list');
    textarea.value = this.bypassList.join('\n');
  }

  async toggleProxy(enabled) {
    try {
      const nodeIndex = enabled ? (this.currentNodeIndex >= 0 ? this.currentNodeIndex : 0) : -1;
      const response = await this.sendMessage({
        action: 'toggleProxy',
        enabled,
        nodeIndex
      });

      if (response.success) {
        this.isEnabled = response.data.isEnabled;
        this.currentNodeIndex = response.data.currentNodeIndex;
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to toggle proxy:', error);
    }
  }

  async switchNode(nodeIndex) {
    try {
      const response = await this.sendMessage({
        action: 'switchNode',
        nodeIndex
      });

      if (response.success) {
        this.currentNodeIndex = response.data.currentNodeIndex;
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to switch node:', error);
    }
  }

  async useNode(index) {
    this.currentNodeIndex = index;
    if (!this.isEnabled) {
      await this.toggleProxy(true);
    } else {
      await this.switchNode(index);
    }
  }

  showNodeForm(editIndex = -1) {
    this.isEditing = editIndex >= 0;
    this.editIndex = editIndex;

    const form = document.getElementById('proxy-form');
    const deleteBtn = document.getElementById('delete-node');
    
    form.style.display = 'block';
    deleteBtn.style.display = this.isEditing ? 'inline-block' : 'none';

    if (this.isEditing) {
      const node = this.nodes[editIndex];
      document.getElementById('edit-index').value = editIndex;
      document.getElementById('node-name').value = node.name;
      document.getElementById('protocol').value = node.protocol;
      document.getElementById('host').value = node.host;
      document.getElementById('port').value = node.port;
      document.getElementById('username').value = node.username || '';
      document.getElementById('password').value = node.password || '';
    } else {
      document.getElementById('node-form').reset();
      document.getElementById('edit-index').value = '';
    }
  }

  hideNodeForm() {
    document.getElementById('proxy-form').style.display = 'none';
    document.getElementById('node-form').reset();
    this.isEditing = false;
    this.editIndex = -1;
  }

  editNode(index) {
    this.showNodeForm(index);
  }

  async saveNode() {
    const name = document.getElementById('node-name').value.trim();
    const protocol = document.getElementById('protocol').value;
    const host = document.getElementById('host').value.trim();
    const port = document.getElementById('port').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name || !host || !port) {
      alert('Please fill in all required fields');
      return;
    }

    const node = {
      name,
      protocol,
      host,
      port: parseInt(port),
      username: username || undefined,
      password: password || undefined
    };

    if (this.isEditing) {
      this.nodes[this.editIndex] = node;
    } else {
      this.nodes.push(node);
    }

    try {
      await this.sendMessage({
        action: 'saveNodes',
        nodes: this.nodes
      });

      this.hideNodeForm();
      this.updateUI();
    } catch (error) {
      console.error('Failed to save node:', error);
      alert('Failed to save node');
    }
  }

  async deleteNode() {
    if (!this.isEditing) return;

    if (confirm('Are you sure you want to delete this proxy node?')) {
      this.nodes.splice(this.editIndex, 1);

      try {
        await this.sendMessage({
          action: 'saveNodes',
          nodes: this.nodes
        });

        this.hideNodeForm();
        this.updateUI();
      } catch (error) {
        console.error('Failed to delete node:', error);
        alert('Failed to delete node');
      }
    }
  }

  async saveBypassList() {
    const textarea = document.getElementById('bypass-list');
    const bypassList = textarea.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    try {
      await this.sendMessage({
        action: 'saveBypassList',
        bypassList
      });

      this.bypassList = bypassList;
      alert('Bypass list saved successfully');
    } catch (error) {
      console.error('Failed to save bypass list:', error);
      alert('Failed to save bypass list');
    }
  }

  exportConfig() {
    const config = {
      nodes: this.nodes,
      bypassList: this.bypassList,
      version: '1.0.0',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omegaone-proxy-config-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importConfig(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const config = JSON.parse(text);

      if (!config.nodes || !Array.isArray(config.nodes)) {
        alert('Invalid configuration file');
        return;
      }

      if (confirm('This will replace your current configuration. Continue?')) {
        this.nodes = config.nodes;
        this.bypassList = config.bypassList || [];

        await this.sendMessage({
          action: 'saveNodes',
          nodes: this.nodes
        });

        await this.sendMessage({
          action: 'saveBypassList',
          bypassList: this.bypassList
        });

        this.updateUI();
        alert('Configuration imported successfully');
      }
    } catch (error) {
      console.error('Failed to import config:', error);
      alert('Failed to import configuration file');
    }
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});