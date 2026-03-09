import api from "@/client/api";
import { useAsyncState } from '@vueuse/core';
import { computed, ref } from 'vue';
import { debounce } from 'perfect-debounce';
import { ConfigDto } from "@/client/apiGen";
import { globalCapture, modInfo, updateModInfo } from "@/store/refs";
import { compareVersions } from "./shouldShowUpdateController";

// 请求参数 ref
const forceDefaultRef = ref(false);
const skipSignatureCheckRef = ref(false);

// 错误信息
export const configReadErr = ref('');
export const configReadErrTitle = ref('');

// 标志位：配置刚从服务器加载，watcher 应忽略首次变更
export const configJustLoaded = ref(false);

const { state: aquaMaiConfig, execute: executeGetConfig, isLoading: configLoading } = useAsyncState(async () => {
  configReadErr.value = '';
  configReadErrTitle.value = '';
  try {
    return (await api.GetAquaMaiConfig({ forceDefault: forceDefaultRef.value, skipSignatureCheck: skipSignatureCheckRef.value })).data;
  } catch (err: any) {
    if (err instanceof Response && !err.bodyUsed) {
      const text = await err.text();
      try {
        const json = JSON.parse(text);
        if (json.detail) {
          configReadErr.value = json.detail;
        }
        if (json.title) {
          configReadErrTitle.value = json.title;
        }
        if (configReadErrTitle.value === 'System.Reflection.TargetInvocationException' && compareVersions(modInfo.value?.aquaMaiVersion || '0.0.0', '1.6.0') < 0) {
          configReadErr.value = 'mod.versionTooLow';
        }
        if (configReadErr.value.includes('Could not migrate the config')) {
          configReadErrTitle.value = 'mod.configVersionHigher';
        }
        return undefined;
      } catch {}
      configReadErr.value = text.split('\n')[0];
      return undefined;
    }
    if (err.error instanceof Error) {
      configReadErr.value = err.error.message.split('\n')[0];
    } else if (err.error) {
      configReadErr.value = err.error.toString().split('\n')[0];
    } else {
      configReadErr.value = err.toString().split('\n')[0];
    }
    return undefined;
  } finally {
    forceDefaultRef.value = false;
    skipSignatureCheckRef.value = false;
  }
}, undefined as ConfigDto | undefined, { immediate: false, shallow: false });

export { aquaMaiConfig, configLoading };

export const updateAquaMaiConfig = async (forceDefault = false, skipSignatureCheck = false) => {
  forceDefaultRef.value = forceDefault;
  skipSignatureCheckRef.value = skipSignatureCheck;
  configJustLoaded.value = true;
  await executeGetConfig();
};

// MuMod 状态
export const muModChannel = computed(() => modInfo.value?.muModChannel ?? 'slow');
export const isBothModsPresent = computed(() => !!modInfo.value?.isBothModsPresent);

const updateMuModChannelImpl = async (channel: string) => {
  try {
    await api.SetMuModChannelAndEnsureCache({ channel });
    await updateModInfo();
    await updateAquaMaiConfig();
  } catch (e: any) {
    globalCapture(e, 'mod.cacheFailed');
  }
};

export const updateMuModChannel = debounce(updateMuModChannelImpl, 1500);
