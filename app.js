/**
 * MailCraft AI - Main Application Controller
 * Coordinates UI, routing, event listeners, state, animations, and toast alerts.
 */

class MailCraftApp {
  constructor() {
    this.currentView = 'generator'; // Default to generator for immediate utility
    this.state = {
      topic: '',
      recipientRole: 'Professor',
      customRecipient: '',
      emailType: 'College Assignment',
      tone: 'Polite',
      language: 'English',
      length: 'Medium',
      lastOutput: null,
      variationCounter: 0,
      activeModalHistoryId: null
    };

    this.init();
  }

  init() {
    this.initTheme();
    this.bindHashRouting();
    this.renderStarterPills();
    this.updateHistoryBadges();
    this.loadSavedSettingsIntoModal();
    this.refreshIcons();

    // Setup input listeners
    const topicInput = document.getElementById('input-topic');
    if (topicInput) {
      topicInput.addEventListener('input', (e) => {
        this.state.topic = e.target.value;
        this.updateCharCount(e.target.value);
        this.hideFormError();
      });
    }

    const customRecipInput = document.getElementById('input-custom-recipient');
    if (customRecipInput) {
      customRecipInput.addEventListener('input', (e) => {
        this.state.customRecipient = e.target.value;
      });
    }

    const typeSelect = document.getElementById('select-email-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.state.emailType = e.target.value;
      });
    }

    // Check hash on load
    const hash = window.location.hash.replace('#', '');
    if (['home', 'generator', 'history', 'about'].includes(hash)) {
      this.navigate(hash);
    } else {
      this.navigate('generator');
    }
  }

  refreshIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  // ==========================================
  // NAVIGATION & ROUTING
  // ==========================================
  bindHashRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'generator', 'history', 'about'].includes(hash)) {
        this.navigate(hash, false);
      }
    });
  }

  navigate(viewName, updateHash = true) {
    if (!['home', 'generator', 'history', 'about'].includes(viewName)) return;

    this.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Hide all views
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show active view
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    // Update active nav links desktop
    ['home', 'generator', 'history', 'about'].forEach(name => {
      const link = document.getElementById(`nav-${name}`);
      if (link) {
        if (name === viewName) {
          link.className = 'nav-link px-3.5 py-2 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 transition-all flex items-center gap-1.5';
        } else {
          link.className = 'nav-link px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-1.5';
        }
      }
    });

    // Close mobile drawer if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }

    // Special View Hooks
    if (viewName === 'history') {
      this.renderHistory();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.refreshIcons();
  }

  toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
      this.refreshIcons();
    }
  }

  // ==========================================
  // THEME (DARK / LIGHT MODE)
  // ==========================================
  initTheme() {
    const savedTheme = localStorage.getItem('mailcraft_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('mailcraft_theme', isDark ? 'dark' : 'light');
    this.showToast(isDark ? 'Switched to Dark Mode 🌙' : 'Switched to Light Mode ☀️', 'info');
    this.refreshIcons();
  }

  // ==========================================
  // STARTER PROMPTS & EXAMPLES
  // ==========================================
  renderStarterPills() {
    const container = document.getElementById('starter-pills-container');
    if (!container || !EXAMPLE_PROMPTS) return;

    container.innerHTML = EXAMPLE_PROMPTS.slice(0, 5).map(ex => `
      <button 
        type="button" 
        onclick="app.loadExample('${ex.id}')"
        class="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-800/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center gap-1.5 shrink-0"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        <span>${ex.title}</span>
      </button>
    `).join('');
  }

  loadExample(exampleId) {
    const ex = EXAMPLE_PROMPTS.find(it => it.id === exampleId);
    if (!ex) return;

    // Apply values to state & form
    this.state.topic = ex.topic;
    this.state.recipientRole = ex.recipient;
    this.state.customRecipient = ex.customRecipient || '';
    this.state.emailType = ex.emailType;
    this.state.tone = ex.tone;
    this.state.language = ex.language;
    this.state.length = ex.length;

    // Update UI elements
    const topicEl = document.getElementById('input-topic');
    if (topicEl) {
      topicEl.value = ex.topic;
      this.updateCharCount(ex.topic);
    }

    const customRecipEl = document.getElementById('input-custom-recipient');
    if (customRecipEl) {
      customRecipEl.value = ex.customRecipient || '';
    }

    const typeEl = document.getElementById('select-email-type');
    if (typeEl) {
      typeEl.value = ex.emailType;
    }

    this.setRecipientRole(ex.recipient, false);
    this.setTone(ex.tone, false);
    this.setLanguage(ex.language, false);
    this.setLength(ex.length, false);

    this.hideFormError();
    this.showToast(`Loaded scenario: "${ex.title}"`, 'info');
    this.navigate('generator');
  }

  fillRandomSample() {
    const randomIndex = Math.floor(Math.random() * EXAMPLE_PROMPTS.length);
    const chosen = EXAMPLE_PROMPTS[randomIndex];
    this.loadExample(chosen.id);
  }

  // ==========================================
  // FORM SELECTION CONTROLS
  // ==========================================
  setRecipientRole(role, triggerState = true) {
    if (triggerState) this.state.recipientRole = role;

    document.querySelectorAll('#recipient-chips button').forEach(btn => {
      if (btn.getAttribute('data-role') === role) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  setTone(tone, triggerState = true) {
    if (triggerState) this.state.tone = tone;

    document.querySelectorAll('#tone-options-grid button').forEach(btn => {
      if (btn.getAttribute('data-tone') === tone) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  setLanguage(lang, triggerState = true) {
    if (triggerState) this.state.language = lang;

    document.querySelectorAll('#language-segmented button').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  setLength(len, triggerState = true) {
    if (triggerState) this.state.length = len;

    document.querySelectorAll('#length-segmented button').forEach(btn => {
      if (btn.getAttribute('data-length') === len) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateCharCount(val) {
    const counter = document.getElementById('topic-char-counter');
    if (counter) {
      counter.textContent = `${val.length} / 500`;
      if (val.length >= 480) {
        counter.classList.add('text-amber-500');
      } else {
        counter.classList.remove('text-amber-500');
      }
    }
  }

  showFormError(msg) {
    const banner = document.getElementById('form-error-banner');
    const text = document.getElementById('form-error-text');
    if (banner && text) {
      text.textContent = msg;
      banner.classList.remove('hidden');
    }
    const topicInput = document.getElementById('input-topic');
    if (topicInput) {
      topicInput.classList.add('border-red-500');
      topicInput.focus();
    }
  }

  hideFormError() {
    const banner = document.getElementById('form-error-banner');
    if (banner) banner.classList.add('hidden');
    const topicInput = document.getElementById('input-topic');
    if (topicInput) topicInput.classList.remove('border-red-500');
  }

  resetForm() {
    this.state.topic = '';
    this.state.customRecipient = '';
    const topicEl = document.getElementById('input-topic');
    if (topicEl) topicEl.value = '';
    const customRecipEl = document.getElementById('input-custom-recipient');
    if (customRecipEl) customRecipEl.value = '';
    this.updateCharCount('');
    this.hideFormError();
    this.showToast('Inputs cleared', 'info');
  }

  newEmail() {
    this.resetForm();
    this.navigate('generator');
    const topicEl = document.getElementById('input-topic');
    if (topicEl) topicEl.focus();
  }

  // ==========================================
  // GENERATION LOGIC
  // ==========================================
  async handleGenerate() {
    const topicEl = document.getElementById('input-topic');
    const topicVal = topicEl ? topicEl.value.trim() : '';

    if (!topicVal) {
      this.showFormError('Please enter the purpose or topic of your email.');
      return;
    }

    this.hideFormError();
    this.setGenerateLoadingState(true);

    try {
      this.state.variationCounter = Date.now();
      const result = await mailCraftAIEngine.generate({
        topic: topicVal,
        recipient: this.state.recipientRole,
        customRecipient: this.state.customRecipient,
        emailType: this.state.emailType,
        tone: this.state.tone,
        language: this.state.language,
        length: this.state.length,
        variationSeed: this.state.variationCounter
      });

      this.state.lastOutput = {
        ...result,
        topic: topicVal,
        recipient: this.state.recipientRole,
        customRecipient: this.state.customRecipient,
        emailType: this.state.emailType,
        tone: this.state.tone,
        language: this.state.language,
        length: this.state.length
      };

      this.renderOutput(result);

      // Auto-save generated draft to persistent history
      const saved = mailCraftHistory.addItem(this.state.lastOutput);
      this.state.lastOutput.id = saved.id;
      this.updateHistoryBadges();

      this.showToast('Email draft generated & saved to history!', 'success');
    } catch (err) {
      console.error('Generation failure:', err);
      this.showFormError(err.message || 'An error occurred while generating the email.');
      this.showToast('Generation failed: ' + err.message, 'danger');
    } finally {
      this.setGenerateLoadingState(false);
    }
  }

  async regenerate() {
    if (!this.state.lastOutput || !this.state.lastOutput.topic) {
      this.handleGenerate();
      return;
    }

    this.setGenerateLoadingState(true);
    try {
      this.state.variationCounter += 1;
      const result = await mailCraftAIEngine.generate({
        topic: this.state.lastOutput.topic,
        recipient: this.state.recipientRole,
        customRecipient: this.state.customRecipient,
        emailType: this.state.emailType,
        tone: this.state.tone,
        language: this.state.language,
        length: this.state.length,
        variationSeed: this.state.variationCounter
      });

      this.state.lastOutput = {
        ...this.state.lastOutput,
        ...result
      };

      this.renderOutput(result);

      // Save alternative draft to history
      const saved = mailCraftHistory.addItem(this.state.lastOutput);
      this.state.lastOutput.id = saved.id;
      this.updateHistoryBadges();

      this.showToast('Generated fresh alternative variation!', 'info');
    } catch (err) {
      this.showToast('Regeneration failed: ' + err.message, 'danger');
    } finally {
      this.setGenerateLoadingState(false);
    }
  }

  setGenerateLoadingState(isLoading) {
    const btn = document.getElementById('btn-generate-email');
    const content = document.getElementById('btn-generate-content');
    const spinner = document.getElementById('btn-generate-spinner');
    const emptyState = document.getElementById('output-empty-state');
    const loadingState = document.getElementById('output-loading-state');
    const bodyBox = document.getElementById('output-body');

    if (isLoading) {
      if (btn) btn.disabled = true;
      if (content) content.classList.add('hidden');
      if (spinner) spinner.classList.remove('hidden');
      if (emptyState) emptyState.classList.add('hidden');
      if (loadingState) loadingState.classList.remove('hidden');
      if (bodyBox) bodyBox.classList.add('hidden');

      // Cycle loading messages for authentic AI feel
      const steps = [
        'Analyzing context & recipient...',
        'Applying tone parameters...',
        'Synthesizing grammatical body...',
        'Finalizing subject & sign-off...'
      ];
      let stepIdx = 0;
      this._loadingInterval = setInterval(() => {
        const stepText = document.getElementById('loading-step-text');
        if (stepText && steps[stepIdx]) {
          stepText.textContent = steps[stepIdx];
          stepIdx = (stepIdx + 1) % steps.length;
        }
      }, 350);

    } else {
      if (this._loadingInterval) clearInterval(this._loadingInterval);
      if (btn) btn.disabled = false;
      if (content) content.classList.remove('hidden');
      if (spinner) spinner.classList.add('hidden');
      if (loadingState) loadingState.classList.add('hidden');
    }
  }

  renderOutput(result) {
    const emptyState = document.getElementById('output-empty-state');
    const bodyBox = document.getElementById('output-body');
    const subjectInput = document.getElementById('output-subject');

    if (emptyState) emptyState.classList.add('hidden');
    if (bodyBox) {
      bodyBox.classList.remove('hidden');
      bodyBox.innerText = result.body;
    }
    if (subjectInput) {
      subjectInput.value = result.subject;
    }

    // Update tags
    const typeBadge = document.getElementById('output-badge-type');
    if (typeBadge) typeBadge.textContent = this.state.emailType;

    const toneBadge = document.getElementById('output-badge-tone');
    if (toneBadge) toneBadge.textContent = this.state.tone;

    const langBadge = document.getElementById('output-badge-lang');
    if (langBadge) langBadge.textContent = this.state.language;

    const engineBadge = document.getElementById('output-engine-badge');
    if (engineBadge && result.source) engineBadge.textContent = result.source;

    this.calculateMetrics(result.body);
  }

  handleOutputEdit() {
    const bodyBox = document.getElementById('output-body');
    const subjectInput = document.getElementById('output-subject');
    const bodyText = bodyBox ? bodyBox.innerText : '';
    const subjectText = subjectInput ? subjectInput.value : '';

    this.calculateMetrics(bodyText);

    if (this.state.lastOutput) {
      this.state.lastOutput.body = bodyText;
      this.state.lastOutput.subject = subjectText;

      // Update in storage if already saved
      if (this.state.lastOutput.id) {
        mailCraftHistory.updateItem(this.state.lastOutput.id, {
          body: bodyText,
          subject: subjectText
        });
      }
    }
  }

  calculateMetrics(text) {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = trimmed.length;
    // Average reading speed: 200 words per minute
    const readSeconds = Math.max(5, Math.round((words / 200) * 60));

    const wordEl = document.getElementById('metric-word-count');
    const charEl = document.getElementById('metric-char-count');
    const readEl = document.getElementById('metric-reading-time');

    if (wordEl) wordEl.textContent = words;
    if (charEl) charEl.textContent = chars;
    if (readEl) readEl.textContent = words > 0 ? `~${readSeconds}s read` : '~0 sec read';
  }

  // ==========================================
  // CLIPBOARD & EXPORT ACTIONS
  // ==========================================
  async copySubject() {
    const subjectInput = document.getElementById('output-subject');
    const text = subjectInput ? subjectInput.value.trim() : '';
    if (!text) {
      this.showToast('No subject line to copy', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Subject copied to clipboard! 📋', 'success');

      const btn = document.getElementById('btn-copy-subject');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-500"></i><span class="text-emerald-500 font-bold">Copied!</span>`;
        this.refreshIcons();
        setTimeout(() => {
          btn.innerHTML = original;
          this.refreshIcons();
        }, 2000);
      }
    } catch (e) {
      this.fallbackCopy(text);
    }
  }

  async copyEmailBody() {
    const bodyBox = document.getElementById('output-body');
    const text = bodyBox ? bodyBox.innerText.trim() : '';
    if (!text) {
      this.showToast('Please generate an email first before copying', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Email body copied to clipboard! ✨', 'success');

      const btn = document.getElementById('btn-copy-body');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Copied!</span>`;
        this.refreshIcons();
        setTimeout(() => {
          btn.innerHTML = original;
          this.refreshIcons();
        }, 2000);
      }
    } catch (e) {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    this.showToast('Copied to clipboard!', 'success');
  }

  downloadTxt() {
    const subjectInput = document.getElementById('output-subject');
    const bodyBox = document.getElementById('output-body');

    const subject = subjectInput ? subjectInput.value.trim() : 'Email Draft';
    const body = bodyBox ? bodyBox.innerText.trim() : '';

    if (!body) {
      this.showToast('Please generate an email first before downloading', 'warning');
      return;
    }

    const content = `=====================================================
MailCraft AI - Generated Email Draft
=====================================================
Subject: ${subject}
Category: ${this.state.emailType}
Tone: ${this.state.tone}
Language: ${this.state.language}
Recipient: ${this.state.customRecipient || this.state.recipientRole}
Generated: ${new Date().toLocaleString()}
=====================================================

${body}

-----------------------------------------------------
Crafted with MailCraft AI - College B.Tech Capstone Project
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanFileName = (subject || 'email-draft').slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${cleanFileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Downloaded as .TXT file 📄', 'success');
  }

  saveCurrentToHistory() {
    if (!this.state.lastOutput || !this.state.lastOutput.body) {
      this.showToast('Generate an email first before saving', 'warning');
      return;
    }

    // Check if body was edited
    const bodyBox = document.getElementById('output-body');
    const subjectInput = document.getElementById('output-subject');
    if (bodyBox) this.state.lastOutput.body = bodyBox.innerText.trim();
    if (subjectInput) this.state.lastOutput.subject = subjectInput.value.trim();

    mailCraftHistory.addItem(this.state.lastOutput);
    this.updateHistoryBadges();
    this.showToast('Saved to your History list! 📌', 'success');

    const saveBtn = document.getElementById('btn-save-history');
    if (saveBtn) {
      saveBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-500">Saved</span>`;
      this.refreshIcons();
      setTimeout(() => {
        saveBtn.innerHTML = `<i data-lucide="bookmark" class="w-3.5 h-3.5"></i><span>Save</span>`;
        this.refreshIcons();
      }, 2000);
    }
  }

  // ==========================================
  // HISTORY VIEW & MANAGEMENT
  // ==========================================
  updateHistoryBadges() {
    const count = mailCraftHistory.getCount();
    const badge = document.getElementById('history-badge');
    const mobileBadge = document.getElementById('mobile-history-badge');

    if (badge) badge.textContent = count;
    if (mobileBadge) mobileBadge.textContent = count;
  }

  renderHistory() {
    const searchVal = document.getElementById('history-search-input')?.value || '';
    const typeVal = document.getElementById('history-filter-type')?.value || 'all';
    const toneVal = document.getElementById('history-filter-tone')?.value || 'all';
    const langVal = document.getElementById('history-filter-lang')?.value || 'all';
    const favOnly = document.getElementById('history-filter-fav-btn')?.classList.contains('active') || false;

    const items = mailCraftHistory.query({
      search: searchVal,
      type: typeVal,
      tone: toneVal,
      language: langVal,
      favoritesOnly: favOnly
    });

    const container = document.getElementById('history-items-container');
    const emptyState = document.getElementById('history-empty-state');

    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = items.map(item => {
      const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const previewText = item.body.replace(/\n+/g, ' ').slice(0, 140);
      const favClass = item.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400 hover:text-amber-500';

      return `
        <div class="glass-card p-4 sm:p-5 space-y-3 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="badge-tag badge-purple text-[10px]">${item.emailType}</span>
                <span class="badge-tag badge-blue text-[10px]">${item.tone}</span>
                <span class="badge-tag badge-green text-[10px]">${item.language}</span>
                <span class="text-[11px] text-slate-400">&bull; ${dateStr}</span>
              </div>
              <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${this.escapeHtml(item.subject || 'Untitled Subject')}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">Recipient: <strong>${this.escapeHtml(item.customRecipient || item.recipient)}</strong></p>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <button 
                onclick="app.toggleFavoriteItem('${item.id}')" 
                class="btn-icon ${favClass}" 
                title="${item.isFavorite ? 'Unfavorite' : 'Add to Favorites'}"
              >
                <i data-lucide="star" class="w-4 h-4"></i>
              </button>
              <button 
                onclick="app.deleteHistoryItem('${item.id}')" 
                class="btn-icon hover:text-red-500 hover:border-red-500" 
                title="Delete"
              >
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            ${this.escapeHtml(previewText)}...
          </p>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <span class="text-[11px] text-slate-400">Topic: ${this.escapeHtml(item.topic.slice(0, 45))}...</span>
            <div class="flex items-center gap-2">
              <button 
                onclick="app.openHistoryModal('${item.id}')" 
                class="btn-secondary text-xs py-1.5 px-2.5 rounded-lg font-semibold flex items-center gap-1"
              >
                <i data-lucide="eye" class="w-3.5 h-3.5"></i> View Details
              </button>
              <button 
                onclick="app.loadHistoryItemIntoGenerator('${item.id}')" 
                class="btn-primary text-xs py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1 shadow-none"
              >
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Open in Editor
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.refreshIcons();
  }

  toggleHistoryFavoritesFilter() {
    const btn = document.getElementById('history-filter-fav-btn');
    if (btn) {
      btn.classList.toggle('active');
    }
    this.renderHistory();
  }

  toggleFavoriteItem(id) {
    const isFav = mailCraftHistory.toggleFavorite(id);
    this.showToast(isFav ? 'Added to Favorites ⭐' : 'Removed from Favorites', 'info');
    this.renderHistory();
  }

  deleteHistoryItem(id) {
    mailCraftHistory.deleteItem(id);
    this.updateHistoryBadges();
    this.renderHistory();
    this.showToast('Item deleted from history', 'info');
  }

  clearAllHistoryConfirm() {
    if (mailCraftHistory.getCount() === 0) {
      this.showToast('History is already empty', 'info');
      return;
    }

    if (confirm('Are you sure you want to delete all saved emails from your history?')) {
      mailCraftHistory.clearAll();
      this.updateHistoryBadges();
      this.renderHistory();
      this.showToast('All history cleared', 'info');
    }
  }

  loadHistoryItemIntoGenerator(id) {
    const item = mailCraftHistory.getItem(id);
    if (!item) return;

    this.state.topic = item.topic;
    this.state.recipientRole = item.recipient;
    this.state.customRecipient = item.customRecipient || '';
    this.state.emailType = item.emailType;
    this.state.tone = item.tone;
    this.state.language = item.language;
    this.state.length = item.length;
    this.state.lastOutput = { ...item };

    // Fill form
    const topicEl = document.getElementById('input-topic');
    if (topicEl) {
      topicEl.value = item.topic;
      this.updateCharCount(item.topic);
    }

    const customRecipEl = document.getElementById('input-custom-recipient');
    if (customRecipEl) {
      customRecipEl.value = item.customRecipient || '';
    }

    const typeEl = document.getElementById('select-email-type');
    if (typeEl) {
      typeEl.value = item.emailType;
    }

    this.setRecipientRole(item.recipient, false);
    this.setTone(item.tone, false);
    this.setLanguage(item.language, false);
    this.setLength(item.length, false);

    this.renderOutput({
      subject: item.subject,
      body: item.body,
      source: item.source || 'Saved History Item'
    });

    this.navigate('generator');
    this.showToast('Loaded email into editor!', 'success');
  }

  // ==========================================
  // HISTORY MODAL VIEW
  // ==========================================
  openHistoryModal(id) {
    const item = mailCraftHistory.getItem(id);
    if (!item) return;

    this.state.activeModalHistoryId = id;
    const modal = document.getElementById('history-modal');
    const subjEl = document.getElementById('modal-history-subject');
    const recipEl = document.getElementById('modal-history-recipient');
    const typeEl = document.getElementById('modal-history-type');
    const toneEl = document.getElementById('modal-history-tone');
    const dateEl = document.getElementById('modal-history-date');
    const bodyEl = document.getElementById('modal-history-body');

    if (subjEl) subjEl.textContent = item.subject;
    if (recipEl) recipEl.textContent = item.customRecipient ? `${item.customRecipient} (${item.recipient})` : item.recipient;
    if (typeEl) typeEl.textContent = item.emailType;
    if (toneEl) toneEl.textContent = item.tone;
    if (dateEl) dateEl.textContent = new Date(item.createdAt).toLocaleString();
    if (bodyEl) bodyEl.textContent = item.body;

    if (modal) modal.classList.add('open');
    this.refreshIcons();
  }

  closeHistoryModal() {
    const modal = document.getElementById('history-modal');
    if (modal) modal.classList.remove('open');
    this.state.activeModalHistoryId = null;
  }

  loadModalItemIntoGenerator() {
    if (this.state.activeModalHistoryId) {
      this.loadHistoryItemIntoGenerator(this.state.activeModalHistoryId);
      this.closeHistoryModal();
    }
  }

  deleteCurrentModalHistoryItem() {
    if (this.state.activeModalHistoryId) {
      this.deleteHistoryItem(this.state.activeModalHistoryId);
      this.closeHistoryModal();
    }
  }

  async copyModalBody() {
    const bodyEl = document.getElementById('modal-history-body');
    const text = bodyEl ? bodyEl.textContent.trim() : '';
    if (text) {
      await navigator.clipboard.writeText(text);
      this.showToast('Email body copied! 📋', 'success');
    }
  }

  // ==========================================
  // SETTINGS MODAL
  // ==========================================
  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    this.loadSavedSettingsIntoModal();
    if (modal) modal.classList.add('open');
    this.refreshIcons();
  }

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('open');
  }

  loadSavedSettingsIntoModal() {
    const config = mailCraftAIEngine.apiConfig;
    const providerSelect = document.getElementById('settings-provider');
    const keyInput = document.getElementById('settings-api-key');
    const modelInput = document.getElementById('settings-model-name');

    if (providerSelect) providerSelect.value = config.provider || 'auto';
    if (keyInput) keyInput.value = config.apiKey || '';
    if (modelInput) modelInput.value = config.model || '';

    this.handleProviderChange();
  }

  handleProviderChange() {
    const providerSelect = document.getElementById('settings-provider');
    const val = providerSelect ? providerSelect.value : 'auto';
    const keyGroup = document.getElementById('settings-api-key-group');
    const modelGroup = document.getElementById('settings-model-group');

    if (val === 'gemini' || val === 'openai') {
      if (keyGroup) keyGroup.classList.remove('hidden');
      if (modelGroup) modelGroup.classList.remove('hidden');
    } else {
      if (keyGroup) keyGroup.classList.add('hidden');
      if (modelGroup) modelGroup.classList.add('hidden');
    }
  }

  saveSettings() {
    const providerSelect = document.getElementById('settings-provider');
    const keyInput = document.getElementById('settings-api-key');
    const modelInput = document.getElementById('settings-model-name');

    const provider = providerSelect ? providerSelect.value : 'auto';
    const apiKey = keyInput ? keyInput.value.trim() : '';
    const model = modelInput ? modelInput.value.trim() : '';

    mailCraftAIEngine.saveConfig({ provider, apiKey, model });
    this.closeSettingsModal();
    this.showToast('AI engine settings saved successfully! ⚙️', 'success');
  }

  // ==========================================
  // TOAST NOTIFICATION SYSTEM
  // ==========================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'danger') iconName = 'alert-octagon';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400"></i>
      <span class="flex-1">${this.escapeHtml(message)}</span>
      <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    `;

    container.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px) scale(0.95)';
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 200);
    }, 3500);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Instantiate global app
const app = new MailCraftApp();
