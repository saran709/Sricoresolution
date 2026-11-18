/**
 * Client-side Browser & DevTools Integrity Guard.
 * Prevents live webpage text/DOM editing via document.designMode, root contentEditable,
 * and localStorage website-CMS/RBAC cache tampering.
 */

const FORBIDDEN_STORAGE_EXACT_KEYS = new Set([
  'sricore_website_settings_cache_v1',
  'sricore_website_settings_ts_v1',
  'sricore_active_profile',
]);

const FORBIDDEN_STORAGE_PREFIXES = [
  'sricore_profile_',
  'sricore_website_settings_',
  'sricore_rbac_',
];

export function purgeUntrustedClientStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToDelete: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (
        FORBIDDEN_STORAGE_EXACT_KEYS.has(key) ||
        FORBIDDEN_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
      ) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore storage access errors in restricted environments
  }
}

function lockDocumentDesignMode(): void {
  if (typeof document === 'undefined') return;

  try {
    if (document.designMode && document.designMode.toLowerCase() !== 'off') {
      document.designMode = 'off';
    }
  } catch {
    // Ignore read-only environments
  }

  try {
    const protoDescriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'designMode'
    );
    const currentDescriptor = Object.getOwnPropertyDescriptor(document, 'designMode');

    if (!currentDescriptor || currentDescriptor.configurable) {
      Object.defineProperty(document, 'designMode', {
        configurable: false,
        enumerable: true,
        get() {
          return 'off';
        },
        set() {
          try {
            protoDescriptor?.set?.call(document, 'off');
          } catch {
            // Ignore setter failures
          }
        },
      });
    }
  } catch {
    // Fallback periodic enforcement if property definition is blocked
  }
}

function stripForbiddenContentEditable(el: Element | null): void {
  if (!el || !(el instanceof HTMLElement)) return;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (el.hasAttribute('contenteditable')) {
    el.removeAttribute('contenteditable');
  }
  if (el.isContentEditable) {
    el.contentEditable = 'false';
  }
}

let initialized = false;

export function initBrowserIntegrityGuard(): void {
  if (initialized || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  initialized = true;

  // 1. Purge any legacy or DevTools-injected CMS/profile caches immediately
  purgeUntrustedClientStorage();

  // 2. Reactively purge forbidden keys if modified in another tab or DevTools
  window.addEventListener('storage', (event: StorageEvent) => {
    const key = event.key;
    if (!key) {
      purgeUntrustedClientStorage();
      return;
    }
    if (
      FORBIDDEN_STORAGE_EXACT_KEYS.has(key) ||
      FORBIDDEN_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
    ) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    }
  });

  // 3. Disable and lock document.designMode against DevTools Console edits
  lockDocumentDesignMode();

  // 4. Prevent contentEditable tampering on root layout elements via DevTools Elements/Console
  const sanitizeRoots = () => {
    stripForbiddenContentEditable(document.documentElement);
    stripForbiddenContentEditable(document.body);
    stripForbiddenContentEditable(document.getElementById('root'));
  };

  sanitizeRoots();

  const observer = new MutationObserver((mutations) => {
    if (document.designMode && document.designMode !== 'off') {
      try {
        document.designMode = 'off';
      } catch {
        // Ignore errors
      }
    }
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'contenteditable' &&
        mutation.target instanceof Element
      ) {
        stripForbiddenContentEditable(mutation.target);
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['contenteditable'],
    subtree: true,
  });
}
