export type FluxyRuntimeMode = 'web' | 'desktop-local' | 'desktop-hybrid';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
  }
}

export function isDesktopRuntime() {
  return typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__);
}

export function getRuntimeMode(isLoggedIn = false): FluxyRuntimeMode {
  if (!isDesktopRuntime()) {
    return 'web';
  }

  return isLoggedIn ? 'desktop-hybrid' : 'desktop-local';
}

export function getLocalSidecarBaseUrl(port?: number | string) {
  const resolvedPort =
    port ??
    process.env.NEXT_PUBLIC_FLUXY_SIDECAR_PORT ??
    process.env.NEXT_PUBLIC_FLUXY_LOCAL_SIDECAR_PORT ??
    8000;

  return `http://127.0.0.1:${resolvedPort}`;
}

export async function resolveDesktopSidecarPort() {
  if (!isDesktopRuntime()) {
    return undefined;
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<number>('get_sidecar_port');
  } catch {
    return undefined;
  }
}
