import { computed } from "vue";
import { modInfo, modUpdateInfo } from "@/store/refs";

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

export const latestVersion = computed(() => {
  const defaultVersionInfo =
    modUpdateInfo.value?.find(it => it.type === 'ci') ||
    modUpdateInfo.value?.find(it => it.default) ||
    modUpdateInfo.value?.[0] || { type: 'builtin' };
  if (defaultVersionInfo.type === "builtin") {
    return {
      version: modInfo.value!.bundledAquaMaiVersion!,
      type: 'builtin',
    };
  }
  let latestVersion = defaultVersionInfo.version!;
  let builtinVersion = modInfo.value!.bundledAquaMaiVersion!;
  if (compareVersions(latestVersion, builtinVersion) < 0) {
    return {
      version: builtinVersion,
      type: 'builtin',
    };
  }
  return defaultVersionInfo;
})

export const shouldShowUpdate = computed(() => {
  if (!modInfo.value?.aquaMaiInstalled) return true;
  if (!modInfo.value?.aquaMaiVersion) return true;
  let currentVersion = modInfo.value.aquaMaiVersion;

  if (!latestVersion.value?.version) return true;

  return compareVersions(currentVersion, latestVersion.value.version) < 0;
})
