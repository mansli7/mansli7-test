(function(window, document) {
  var STORAGE_KEY = 'mansli7-site-lang';

  function normalizeLang(lang) {
    return lang === 'zh' ? 'zh' : 'en';
  }

  function getStoredLang() {
    try {
      return normalizeLang(window.localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return 'en';
    }
  }

  function getCurrentLang() {
    return normalizeLang(document.documentElement.getAttribute('data-site-lang'));
  }

  function setRootLang(lang) {
    var normalized = normalizeLang(lang);
    document.documentElement.setAttribute('data-site-lang', normalized);
    document.documentElement.setAttribute('lang', normalized === 'zh' ? 'zh-Hant' : 'en');
    return normalized;
  }

  function syncSwitches(lang, scope) {
    (scope || document).querySelectorAll('[data-lang-switch]').forEach(function(el) {
      var targetLang = normalizeLang(el.getAttribute('data-lang-switch'));
      var isActive = targetLang === lang;
      el.setAttribute('aria-pressed', String(isActive));
      el.classList.toggle('lang-switch-active', isActive);
    });
  }

  function applyLang(lang, scope) {
    var normalized = setRootLang(lang);
    syncSwitches(normalized, scope);
    document.dispatchEvent(new CustomEvent('mansli7:langchange', {
      detail: { lang: normalized }
    }));
    return normalized;
  }

  function setLang(lang, scope) {
    var normalized = normalizeLang(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (error) {
      // Ignore storage failures and still apply the in-memory preference.
    }
    return applyLang(normalized, scope);
  }

  function localizePath(pathname, targetLang) {
    var normalized = normalizeLang(targetLang);
    var path = pathname || '/';

    // On the deployed site window.location.pathname includes site.baseurl
    // (e.g. /mansli7-test/bs/sq/en/genesis); strip it before matching the
    // route patterns, then re-add it to the returned path.
    var base = (window.Mansli7BaseUrl || '').replace(/\/$/, '');
    var rel = path;
    if (base && (rel === base || rel.indexOf(base + '/') === 0)) {
      rel = rel.slice(base.length) || '/';
    }

    var localized;
    var match = rel.match(/^\/bs\/sq\/(en|zh)\/([^/]+)\/?$/);
    if (match) {
      localized = '/bs/sq/' + normalized + '/' + match[2];
    } else if (
      rel === '/bs/ar/2026-en' || rel === '/bs/ar/2026-en/' ||
      rel === '/bs/ar/2026-zh' || rel === '/bs/ar/2026-zh/'
    ) {
      localized = normalized === 'zh' ? '/bs/ar/2026-zh' : '/bs/ar/2026-en';
    } else {
      return path;
    }

    return base + localized;
  }

  function bindSwitches(scope) {
    (scope || document).querySelectorAll('[data-lang-switch]').forEach(function(el) {
      if (el.dataset.langBound === '1') return;
      el.dataset.langBound = '1';
      el.addEventListener('click', function(event) {
        var targetLang = normalizeLang(el.getAttribute('data-lang-switch'));
        var targetPath = localizePath(window.location.pathname, targetLang);
        var href = el.getAttribute('href');
        setLang(targetLang, scope || document);

        if (href && href !== '#') {
          return;
        }

        event.preventDefault();
        if (targetPath !== window.location.pathname) {
          window.location.assign(targetPath + window.location.search + window.location.hash);
        }
      });
    });

    syncSwitches(getCurrentLang(), scope);
  }

  function init() {
    applyLang(getStoredLang());
    bindSwitches(document);
  }

  window.Mansli7Lang = {
    applyLang: applyLang,
    bindSwitches: bindSwitches,
    getCurrentLang: getCurrentLang,
    getStoredLang: getStoredLang,
    localizePath: localizePath,
    setLang: setLang
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);