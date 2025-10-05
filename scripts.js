document.addEventListener("DOMContentLoaded", () => {
  bootstrapBios();
});

function bootstrapBios() {
  const root = document.getElementById('bios-root');
  if (!root) return;
  // Ensure keyboard events are captured
  if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
  try { root.focus({ preventScroll: true }); } catch (_) { root.focus(); }

  const tabButtons = Array.from(document.querySelectorAll('.bios-tab'));
  const panels = {
    main: document.getElementById('panel-main'),
    apps: document.getElementById('panel-apps'),
    publications: document.getElementById('panel-publications'),
    experience: document.getElementById('panel-experience'),
    contact: document.getElementById('panel-contact'),
    exit: document.getElementById('panel-exit'),
  };

  const helpEl = document.getElementById('help-content');
  const toastEl = document.getElementById('bios-toast');
  const clockEl = document.getElementById('bios-clock');
  const themeValue = document.getElementById('bios-theme-value');

  let activeTab = 'main';
  let selectedIndex = 0;

  updateClock(clockEl);
  setInterval(() => updateClock(clockEl), 1000);

  root.addEventListener('click', (e) => {
    const tab = e.target.closest('.bios-tab');
    if (tab) {
      switchTab(tab.dataset.tab);
      return;
    }
    const option = e.target.closest('.bios-option');
    if (option) {
      setSelectedTo(option);
      activateOption(option);
    }
  });

  window.addEventListener('keydown', (e) => {
    handleKey(e);
  }, { passive: false });

  // Initialize first selection
  refreshSelection();
  wireHoverHelp();

  function switchTab(tabId) {
    if (!panels[tabId]) return;
    activeTab = tabId;
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    Object.entries(panels).forEach(([id, el]) => el.classList.toggle('active', id === tabId));
    selectedIndex = 0;
    refreshSelection();
  }

  function getActiveList() {
    const panel = panels[activeTab];
    return panel ? Array.from(panel.querySelectorAll('.bios-option')) : [];
  }

  function refreshSelection() {
    const list = getActiveList();
    if (!list.length) return;
    if (selectedIndex < 0) selectedIndex = 0;
    if (selectedIndex >= list.length) selectedIndex = list.length - 1;
    list.forEach((el, i) => el.classList.toggle('selected', i === selectedIndex));
    const sel = list[selectedIndex];
    if (sel) {
      updateHelp(sel);
      // Ensure the selected option is visible within the panel without moving the whole page
      try {
        sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } catch (_) {
        // Fallback: manual containment scroll
        const container = sel.closest('.bios-panel');
        if (container) {
          const cTop = container.scrollTop;
          const cBottom = cTop + container.clientHeight;
          const oTop = sel.offsetTop;
          const oBottom = oTop + sel.offsetHeight;
          if (oTop < cTop) container.scrollTop = oTop;
          else if (oBottom > cBottom) container.scrollTop = oBottom - container.clientHeight;
        }
      }
    }
  }

  function setSelectedTo(optionEl) {
    const list = getActiveList();
    const idx = list.indexOf(optionEl);
    if (idx !== -1) {
      selectedIndex = idx;
      refreshSelection();
    }
  }

  function updateHelp(optionEl) {
    const text = optionEl.getAttribute('data-help') || 'Use arrow keys to navigate. Enter to select.';
    if (helpEl) helpEl.textContent = text;
  }

  function handleKey(e) {
    const list = getActiveList();
    const key = e.key;
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Home","End"].includes(key)) {
      e.preventDefault();
    }
    if (!list.length) return;

    if (key === 'ArrowDown') {
      selectedIndex = (selectedIndex + 1) % list.length;
      refreshSelection();
    } else if (key === 'ArrowUp') {
      selectedIndex = (selectedIndex - 1 + list.length) % list.length;
      refreshSelection();
    } else if (key === 'PageDown') {
      selectedIndex = Math.min(selectedIndex + 7, list.length - 1);
      refreshSelection();
    } else if (key === 'PageUp') {
      selectedIndex = Math.max(selectedIndex - 7, 0);
      refreshSelection();
    } else if (key === 'Home') {
      selectedIndex = 0;
      refreshSelection();
    } else if (key === 'End') {
      selectedIndex = list.length - 1;
      refreshSelection();
    } else if (key === 'ArrowRight') {
      const idx = tabButtons.findIndex(t => t.dataset.tab === activeTab);
      const next = (idx + 1) % tabButtons.length;
      switchTab(tabButtons[next].dataset.tab);
    } else if (key === 'ArrowLeft') {
      const idx = tabButtons.findIndex(t => t.dataset.tab === activeTab);
      const prev = (idx - 1 + tabButtons.length) % tabButtons.length;
      switchTab(tabButtons[prev].dataset.tab);
    } else if (key === 'Enter') {
      activateOption(list[selectedIndex]);
    } else if (key === 'F9') {
      loadDefaults();
    } else if (key === 'F10') {
      saveAndExit();
    } else if (key === 'Escape') {
      if (activeTab !== 'exit') switchTab('exit');
    } else if (key === 'F1') {
      showToast('Navigation: Arrows | Enter: Select | Esc: Exit | F9/F10');
    }
  }

  function activateOption(optionEl) {
    if (!optionEl) return;
    const link = optionEl.getAttribute('data-link');
    const toggle = optionEl.getAttribute('data-toggle');
    const action = optionEl.getAttribute('data-action');

    if (link) {
      window.open(link, '_blank');
      showToast('Opening link...');
      return;
    }
    if (toggle === 'theme') {
      const amber = root.classList.toggle('bios-amber');
      if (themeValue) themeValue.textContent = amber ? 'Amber' : 'Blue';
      showToast(`Theme set to ${themeValue ? themeValue.textContent : (amber ? 'Amber' : 'Blue')}`);
      return;
    }
    if (action === 'save') {
      saveAndExit();
      return;
    }
    if (action === 'defaults') {
      loadDefaults();
      return;
    }
    if (action === 'quit') {
      showToast('Exit without saving is not available here.');
      return;
    }
  }

  function loadDefaults() {
    root.classList.remove('bios-amber');
    if (themeValue) themeValue.textContent = 'Blue';
    switchTab('main');
    showToast('Defaults loaded');
  }

  function saveAndExit() {
    showToast('Settings saved');
  }

  function showToast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  function wireHoverHelp() {
    root.querySelectorAll('.bios-option').forEach(el => {
      el.addEventListener('mouseenter', () => updateHelp(el));
      el.addEventListener('mouseleave', refreshSelection);
    });
  }
}

function updateClock(clockEl) {
  if (!clockEl) return;
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const hh = String(d.getHours()).padStart(2,'0');
  const mi = String(d.getMinutes()).padStart(2,'0');
  const ss = String(d.getSeconds()).padStart(2,'0');
  clockEl.textContent = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
