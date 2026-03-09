import { defineComponent, ref, computed } from 'vue';
import { globalCapture, modInfo, updateModInfo } from "@/store/refs";
import { modUpdateInfo } from "@/store/appUpdate";
import api from "@/client/api";
import { useI18n } from 'vue-i18n';
import { Button, DropMenu } from '@munet/ui';
import { useAsyncState } from '@vueuse/core';
import { updateAquaMaiConfig } from './refs';

export default defineComponent({
  setup() {
    const showDone = ref(false);
    const { t } = useI18n();
    const installType = ref<'slow' | 'ci' | 'mumod'>('slow');

    const { isLoading: installing, execute: doInstallAsync } = useAsyncState(
      async () => {
        const type = installType.value;
        if (type === 'mumod') {
          await api.InstallMuMod();
        } else {
          const version = modUpdateInfo.value?.find(it => it.type === type);
          if (!version) throw new Error(t('mod.versionNotFound'));
          const urls = [version.url!];
          if (version.url2) urls.push(version.url2);
          await api.InstallAquaMaiOnline({ type, urls, sign: version.sign });
        }
        await updateModInfo();
        await updateAquaMaiConfig();
        showDone.value = true;
        setTimeout(() => (showDone.value = false), 3000);
      },
      undefined,
      {
        immediate: false,
        onError: (e: any) => globalCapture(e, t('mod.installFailed')),
      }
    );

    const doInstall = (type: 'slow' | 'ci' | 'mumod') => {
      installType.value = type;
      doInstallAsync(0);
    };

    const formatVersionDesc = (type: string) => {
      const entry = modUpdateInfo.value?.find(it => it.type === type);
      if (!entry?.version) return '';
      const date = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '';
      return date ? `${entry.version} · ${date}` : `${entry.version}`;
    };

    const installChannel = (type: 'slow' | 'ci') => {
      doInstall(type);
    };

    const options = computed(() => {
      const result = [];
      if (modUpdateInfo.value?.find(it => it.type === 'slow' && it.url)) {
        result.push({
          label: t('mod.stableChannel'),
          desc: formatVersionDesc('slow'),
          action: () => installChannel('slow'),
        });
      }
      if (modUpdateInfo.value?.find(it => it.type === 'ci' && it.url)) {
        result.push({
          label: t('mod.fastChannel'),
          desc: formatVersionDesc('ci'),
          action: () => installChannel('ci'),
        });
      }
      result.push({
        label: 'MuMod',
        desc: t('mod.mumodDesc'),
        action: () => doInstall('mumod'),
      });
      return result;
    });

    return () => (
      <DropMenu options={options.value}>
        {{
          trigger: (onClick: any) => (
            <Button ing={installing.value} onClick={onClick}>
              {showDone.value
                ? <span class="i-material-symbols-done" />
                : modInfo.value?.aquaMaiInstalled || modInfo.value?.muModInstalled
                  ? t('mod.reinstallUpdate')
                  : t('mod.install')}
            </Button>
          ),
        }}
      </DropMenu>
    );
  },
});
