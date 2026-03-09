import { ref } from "vue";
import { useStorage } from "@vueuse/core";
import { locale } from "@/locales";
import { aquaMaiVersionConfig } from "@/client/api";

const CHANGELOG_BUCKET_BASE = 'https://munet-version-config-1251600285.cos.ap-shanghai.myqcloud.com/mcm-changelog';

// --- Mod 更新 ---

export const modUpdateInfo = ref<Awaited<ReturnType<typeof aquaMaiVersionConfig.getGetConfig>>['data']>([])

export const updateModUpdateInfo = async () => {
  try {
    modUpdateInfo.value = await Promise.any([
      (async () => {
        const res = await aquaMaiVersionConfig.getGetConfig({
          cache: 'no-cache',
        });
        return res.data;
      })(),
      (async () => {
        const res = await fetch('https://munet-version-config-1251600285.cos.ap-shanghai.myqcloud.com/aquamai.json', {
          cache: 'no-cache',
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch mod update info: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      })(),
    ]);
  } catch (e) {
    console.error('Failed to get mod update info:', e);
  }
}

// --- 应用更新 ---

export const appUpdateInfo = ref<{ version: string } | null>(null);

export const updateAppUpdateInfo = async () => {
  try {
    const res = await fetch('https://munet-version-config-1251600285.cos.ap-shanghai.myqcloud.com/mcm.json', {
      cache: 'no-cache',
    });
    if (!res.ok) return;
    appUpdateInfo.value = await res.json();
    // 预加载新版本的更新日志
    if (appUpdateInfo.value?.version) {
      eagerFetchChangelog(appUpdateInfo.value.version);
    }
  } catch (e) {
    console.error('Failed to get app update info:', e);
  }
}

// --- 更新日志 ---

export const showChangelogModal = ref(false);
export const changelogContent = ref('');
export const changelogTargetVersion = ref('');
export const changelogAutoPopupDone = ref(false);
export const lastShownChangelogVersion = useStorage('lastShownChangelogVersion', '');

export const getCleanVersion = (v: string) => v.split('+')[0];

/**
 * 构建 locale 回退链：当前语言 → 基础语言 → en
 * 例如 zh-TW → zh → en
 */
function getLocaleFallbackChain(): string[] {
  const current = locale.value;
  const chain = [current];
  if (current.includes('-')) {
    chain.push(current.split('-')[0]);
  }
  if (!chain.includes('en')) {
    chain.push('en');
  }
  return chain;
}

async function fetchChangelog(ver: string): Promise<string> {
  const cleanVer = getCleanVersion(ver);
  for (const loc of getLocaleFallbackChain()) {
    try {
      const res = await fetch(`${CHANGELOG_BUCKET_BASE}/${cleanVer}.${loc}.md`, { cache: 'no-cache' });
      if (res.ok) return await res.text();
    } catch {
      // 网络错误，尝试下一个 locale
    }
  }
  return '';
}

// 更新日志缓存：版本号 + 语言链 → fetch promise
const changelogCache = new Map<string, Promise<string>>();
let openChangelogRequestId = 0;

function getChangelogCacheKey(ver: string) {
  const cleanVer = getCleanVersion(ver);
  return `${cleanVer}|${getLocaleFallbackChain().join('>')}`;
}

export function eagerFetchChangelog(ver: string) {
  const key = getChangelogCacheKey(ver);
  if (!changelogCache.has(key)) {
    changelogCache.set(key, fetchChangelog(ver));
  }
}

async function getChangelogCached(ver: string): Promise<string> {
  const key = getChangelogCacheKey(ver);
  const cached = changelogCache.get(key);
  if (cached) return cached;
  const promise = fetchChangelog(ver);
  changelogCache.set(key, promise);
  return promise;
}

export async function openChangelog(ver: string, options?: {
  showAfterLoaded?: boolean;
  skipIfEmpty?: boolean;
}) {
  const requestId = ++openChangelogRequestId;
  const cleanVer = getCleanVersion(ver);
  const showAfterLoaded = !!options?.showAfterLoaded;
  const skipIfEmpty = !!options?.skipIfEmpty;

  changelogTargetVersion.value = cleanVer;
  changelogContent.value = '';

  if (!showAfterLoaded) {
    showChangelogModal.value = true;
  }

  const content = await getChangelogCached(ver);
  if (requestId !== openChangelogRequestId) {
    return false;
  }
  if (skipIfEmpty && !content) {
    showChangelogModal.value = false;
    return false;
  }

  changelogContent.value = content;
  if (showAfterLoaded) {
    showChangelogModal.value = true;
  }
  return true;
}
