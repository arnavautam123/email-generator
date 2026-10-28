/**
 * MailCraft AI - History & Persistence Manager
 * Manages local storage persistence, CRUD operations, searching, filtering, and export.
 */

class MailCraftHistory {
  constructor() {
    this.storageKey = 'mailcraft_history_v2';
    this.items = this.loadItems();
  }

  loadItems() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.error('Failed to write history to localStorage', e);
    }
  }

  /**
   * Add a new generated or saved email
   * @param {Object} item
   * @returns {Object} saved item with id and timestamps
   */
  addItem(item) {
    const newItem = {
      id: item.id || 'mc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      subject: item.subject || 'Untitled Subject',
      body: item.body || '',
      topic: item.topic || '',
      recipient: item.recipient || 'General',
      customRecipient: item.customRecipient || '',
      emailType: item.emailType || 'Professional',
      tone: item.tone || 'Professional',
      language: item.language || 'English',
      length: item.length || 'Medium',
      isFavorite: !!item.isFavorite,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: item.source || 'MailCraft AI'
    };

    // Prepend to list
    this.items.unshift(newItem);
    this.saveToStorage();

    // Optionally sync with backend
    this.syncWithBackend(newItem).catch(() => {});

    return newItem;
  }

  updateItem(id, updates) {
    const index = this.items.findIndex(it => it.id === id);
    if (index === -1) return null;

    this.items[index] = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage();
    return this.items[index];
  }

  deleteItem(id) {
    this.items = this.items.filter(it => it.id !== id);
    this.saveToStorage();
    return true;
  }

  getItem(id) {
    return this.items.find(it => it.id === id) || null;
  }

  clearAll() {
    this.items = [];
    this.saveToStorage();
  }

  toggleFavorite(id) {
    const item = this.getItem(id);
    if (!item) return false;
    item.isFavorite = !item.isFavorite;
    item.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return item.isFavorite;
  }

  /**
   * Query items with search and filters
   */
  query({ search = '', type = 'all', tone = 'all', language = 'all', favoritesOnly = false }) {
    let results = [...this.items];

    if (favoritesOnly) {
      results = results.filter(it => it.isFavorite);
    }

    if (type && type !== 'all') {
      results = results.filter(it => it.emailType.toLowerCase() === type.toLowerCase());
    }

    if (tone && tone !== 'all') {
      results = results.filter(it => it.tone.toLowerCase() === tone.toLowerCase());
    }

    if (language && language !== 'all') {
      results = results.filter(it => it.language.toLowerCase() === language.toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(it => 
        (it.subject && it.subject.toLowerCase().includes(q)) ||
        (it.topic && it.topic.toLowerCase().includes(q)) ||
        (it.body && it.body.toLowerCase().includes(q)) ||
        (it.recipient && it.recipient.toLowerCase().includes(q)) ||
        (it.customRecipient && it.customRecipient.toLowerCase().includes(q))
      );
    }

    return results;
  }

  getCount() {
    return this.items.length;
  }

  /**
   * Export all history as JSON file
   */
  exportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mailcraft-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Export history as CSV
   */
  exportCSV() {
    if (this.items.length === 0) return false;

    const headers = ['ID', 'Date', 'Type', 'Tone', 'Language', 'Recipient', 'Subject', 'Topic', 'Body'];
    const rows = this.items.map(it => [
      `"${it.id}"`,
      `"${it.createdAt}"`,
      `"${it.emailType}"`,
      `"${it.tone}"`,
      `"${it.language}"`,
      `"${it.customRecipient || it.recipient}"`,
      `"${(it.subject || '').replace(/"/g, '""')}"`,
      `"${(it.topic || '').replace(/"/g, '""')}"`,
      `"${(it.body || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mailcraft-history-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }

  async syncWithBackend(item) {
    if (!window.location.protocol.startsWith('http')) return;
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch (e) {
      // Graceful silence if running statically without backend
    }
  }
}

// Global instance
const mailCraftHistory = new MailCraftHistory();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MailCraftHistory, mailCraftHistory };
}
