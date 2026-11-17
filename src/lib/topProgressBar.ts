import NProgress from 'nprogress';

// Configure NProgress for a subtle, responsive, non-intrusive top bar
NProgress.configure({
  showSpinner: false,
  minimum: 0.12,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  speed: 280,
  trickle: true,
  trickleSpeed: 160,
});

const activeTokens = new Set<string>();
let tokenCounter = 0;
let finishTimeoutId: ReturnType<typeof setTimeout> | null = null;
let safetyTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isRunning = false;

const FINISH_DEBOUNCE_MS = 140;
const SAFETY_MAX_DURATION_MS = 12000;

function clearTimers() {
  if (finishTimeoutId !== null) {
    clearTimeout(finishTimeoutId);
    finishTimeoutId = null;
  }
  if (safetyTimeoutId !== null) {
    clearTimeout(safetyTimeoutId);
    safetyTimeoutId = null;
  }
}

function scheduleSafetyReset() {
  if (safetyTimeoutId !== null) {
    clearTimeout(safetyTimeoutId);
  }
  safetyTimeoutId = setTimeout(() => {
    activeTokens.clear();
    isRunning = false;
    NProgress.done();
    safetyTimeoutId = null;
  }, SAFETY_MAX_DURATION_MS);
}

/**
 * Starts or increments the top-of-page progress bar for a given operation token.
 * Returns an idempotent stop function that marks this specific operation as finished.
 */
export function startProgress(customToken?: string): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const token = customToken || `progress_${++tokenCounter}`;

  if (finishTimeoutId !== null) {
    clearTimeout(finishTimeoutId);
    finishTimeoutId = null;
  }

  const wasEmpty = activeTokens.size === 0;
  activeTokens.add(token);

  if (wasEmpty || !isRunning) {
    isRunning = true;
    NProgress.start();
  } else {
    NProgress.inc(0.06);
  }

  scheduleSafetyReset();

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    doneProgress(token);
  };
}

/**
 * Marks a specific progress token (or all tokens if omitted) as completed.
 * Smoothly finishes the bar after a short debounce window to avoid flicker
 * when sequential route chunks and data queries fire back-to-back.
 */
export function doneProgress(token?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    activeTokens.delete(token);
  } else {
    activeTokens.clear();
  }

  if (activeTokens.size > 0) {
    return;
  }

  if (finishTimeoutId !== null) {
    clearTimeout(finishTimeoutId);
  }

  finishTimeoutId = setTimeout(() => {
    if (activeTokens.size === 0 && isRunning) {
      isRunning = false;
      NProgress.done();
      clearTimers();
    }
  }, FINISH_DEBOUNCE_MS);
}

/**
 * Wraps any Promise so the top progress bar automatically runs until it settles.
 */
export function trackPromise<T>(promise: Promise<T>, tokenPrefix = 'async'): Promise<T> {
  const stop = startProgress(`${tokenPrefix}_${++tokenCounter}`);
  return promise.finally(stop);
}

export { NProgress };
