import { computed } from "vue";
import { useStorage } from "@vueuse/core";
import { modInfo } from "@/store/refs";
import { modUpdateInfo } from "@/store/appUpdate";

export function compareVersions(v1: string, v2: string) {
  if (v1.startsWith('v')) {
    v1 = v1.substring(1);
  }
  if (v2.startsWith('v')) {
    v2 = v2.substring(1);
  }
  let update1 = 0;
  let update2 = 0;
  if (v1.includes('-')) {
    update1 = Number(v1.split('-')[1]);
    v1 = v1.split('-')[0];
  }
  if (v2.includes('-')) {
    update2 = Number(v2.split('-')[1]);
    v2 = v2.split('-')[0];
  }
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] || 0; // 默认值为 0
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;  // v1 大于 v2
    if (num1 < num2) return -1; // v1 小于 v2
  }

  if (update1 > update2) return 1;
  if (update1 < update2) return -1;

  return 0; // v1 等于 v2
}

export const selectedChannel = useStorage<'slow' | 'ci'>('aquamai-update-channel', 'slow');

// MuMod 模式：MuMod 已安装且没有冲突（两者都不存在的情况不算 MuMod 模式）
export const isMuModMode = computed(() => {
  return !!modInfo.value?.muModInstalled && !modInfo.value?.isBothModsPresent;
});

export const latestVersion = computed(() => {
  // MuMod 模式下，使用 muModChannel 对应的 API type 查找最新版本
  const effectiveChannel = isMuModMode.value
    ? (modInfo.value?.muModChannel === 'fast' ? 'ci' : 'slow')
    : selectedChannel.value;
  const defaultVersionInfo =
    modUpdateInfo.value?.find(it => it.type === effectiveChannel) ||
    modUpdateInfo.value?.find(it => it.default) ||
    modUpdateInfo.value?.[0];
  if (!defaultVersionInfo?.version) {
    return {
      version: undefined as string | undefined,
      type: 'unknown',
    };
  }
  return defaultVersionInfo;
})

export const shouldShowUpdate = computed(() => {
  if (isMuModMode.value) {
    // MuMod 模式下：比较缓存版本和最新版本
    if (!modInfo.value?.muModCacheVersion) return true;
    const muModType = modInfo.value?.muModChannel === 'fast' ? 'ci' : 'slow';
    const muModLatest = modUpdateInfo.value?.find(it => it.type === muModType);
    if (!muModLatest?.version) return false;
    return compareVersions(modInfo.value.muModCacheVersion, muModLatest.version) < 0;
  }
  if (!modInfo.value?.aquaMaiInstalled) return true;
  if (!modInfo.value?.aquaMaiVersion) return true;
  let currentVersion = modInfo.value.aquaMaiVersion;

  if (!latestVersion.value?.version) return false;

  return compareVersions(currentVersion, latestVersion.value.version) < 0;
})
