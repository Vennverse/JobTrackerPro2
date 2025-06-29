// AutoJobr Extension Configuration
// This file manages API endpoint configuration for different deployment environments

class ExtensionConfig {
  constructor() {
    this.possibleUrls = [
      'https://60e68a76-86c4-4eef-b2f5-8a97de774d09-00-f9a0u7nh8k0p.kirk.replit.dev',
      'https://autojobr.replit.app',
      'http://localhost:5000'
    ];
    this.currentApiUrl = null;
  }

  async detectApiUrl() {
    // Check storage first
    const stored = await chrome.storage.sync.get(['apiUrl']);
    if (stored.apiUrl && await this.testConnection(stored.apiUrl)) {
      this.currentApiUrl = stored.apiUrl;
      return this.currentApiUrl;
    }

    // Auto-detect working URL
    for (const url of this.possibleUrls) {
      if (await this.testConnection(url)) {
        this.currentApiUrl = url;
        await chrome.storage.sync.set({ apiUrl: url });
        return url;
      }
    }

    // Default fallback
    this.currentApiUrl = this.possibleUrls[0];
    await chrome.storage.sync.set({ apiUrl: this.currentApiUrl });
    return this.currentApiUrl;
  }

  async testConnection(url) {
    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'HEAD',
        mode: 'cors',
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getApiUrl() {
    if (!this.currentApiUrl) {
      await this.detectApiUrl();
    }
    return this.currentApiUrl;
  }

  async updateApiUrl(newUrl) {
    if (await this.testConnection(newUrl)) {
      this.currentApiUrl = newUrl;
      await chrome.storage.sync.set({ apiUrl: newUrl });
      return true;
    }
    return false;
  }
}

// Export for use in other extension files
window.ExtensionConfig = ExtensionConfig;