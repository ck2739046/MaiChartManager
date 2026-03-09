import api from '@/client/api';
import { IEntryState, ISectionState, Section } from '@/client/apiGen';
import { t } from '@/locales';
import { globalCapture } from '@/store/refs';
import { useAsyncState } from '@vueuse/core';
import { Button, TextInput, DropMenu, addToast } from '@munet/ui';
import { defineComponent, PropType } from 'vue';
import ConfigEntry from '../../ConfigEntry';
import useAsync from '@/hooks/useAsync';
import { ENTRY_GROUP_PADDING, ENTRY_LABEL_CLASS } from '../../constants';

const deviceStatus = useAsync(
  async () => {
    const status = await api.GetPdxDriverStatus();
    return status.data;
  },
  null, true,
);

export default defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props) {
    const PREFIX = 'GameSystem.PdxTouch.';
    const knownPaths = [PREFIX + 'Path1p', PREFIX + 'Path2p'];


    const refresh = () => {
      deviceStatus.refresh();
    };

    // Driver switch
    const switchDriver = useAsyncState(async () => {
      const isWinusb = deviceStatus.data.value?.isUsingWinusb;
      const direction = isWinusb ? 'wintouch' : 'exclusive';
      await api.SwitchPdxDriver({ direction });
      addToast({message: t('mod.pdx.switchSuccess'), type: 'success'});
      refresh();
    }, undefined, {
      immediate: false,
      onError(e: any) {
        if (e?.status === 400) {
          globalCapture(e, t('mod.pdx.switchCancelled'));
        } else {
          globalCapture(e, t('mod.pdx.switchFailed'));
        }
        refresh();
      },
    });

    return () => {
      const status = deviceStatus.data.value;
      const paths = status?.devicePaths ?? [];

      return <div class={["flex flex-col gap-2", ENTRY_GROUP_PADDING]}>
        {/* Device status area */}
        <div class="flex gap-2 items-center m-l-35 flex-wrap">
          {status && !status.available && <span class="op-60">{t('mod.pdx.unavailable')}</span>}
          {status?.available && status.deviceCount === 0 && <span class="op-60">{t('mod.pdx.noDevice')}</span>}
          {status?.available && !!status.deviceCount && <>
            <span>{t('mod.pdx.deviceCount', { count: status.deviceCount })}</span>
            <span class="op-60 text-sm">
              {status.isUsingWinusb ? t('mod.pdx.driverWinusb') : t('mod.pdx.driverDefault')}
            </span>
          </>}
          <Button onClick={refresh} ing={deviceStatus.loading.value}>
            {t('mod.pdx.refresh')}
          </Button>
          {status?.available && (status?.deviceCount ?? 0) > 0 &&
            <Button
              onClick={() => switchDriver.execute()}
              ing={switchDriver.isLoading.value}
            >
              {status?.isUsingWinusb ? t('mod.pdx.switchToWintouch') : t('mod.pdx.switchToExclusive')}
            </Button>
          }
        </div>

        <div class="grid grid-cols-1 min-[500px]:grid-cols-2 gap-y-12px">
          {/* path1p input */}
          {props.section.entries?.some(it => it.path === PREFIX + 'Path1p') &&
            <div class="flex gap-2 items-start">
              <div class={ENTRY_LABEL_CLASS}>{t('mod.pdx.path1P')}</div>
              <div class="flex-1 flex flex-col gap-1">
                <DropMenu
                  options={(paths).map(p => ({
                    label: p,
                    action: () => { props.entryStates[PREFIX + 'Path1p'].value = p; },
                  }))}
                >
                  {{
                    trigger: (toggle: (val?: boolean) => void) =>
                      <TextInput
                        class="w-full" innerClass="h-42px!"
                        v-model:value={props.entryStates[PREFIX + 'Path1p'].value}
                        onFocus={() => paths.length > 0 && toggle(true)}
                      />,
                  }}
                </DropMenu>
                <div class="text-sm op-80">{t('mod.pdx.pathDesc')}</div>
              </div>
            </div>
          }

          {/* path2p input */}
          {props.section.entries?.some(it => it.path === PREFIX + 'Path2p') &&
            <div class="flex gap-2 items-start">
              <div class={ENTRY_LABEL_CLASS}>{t('mod.pdx.path2P')}</div>
              <div class="flex-1 flex flex-col gap-1">
                <DropMenu
                  options={(paths).map(p => ({
                    label: p,
                    action: () => { props.entryStates[PREFIX + 'Path2p'].value = p; },
                  }))}
                >
                  {{
                    trigger: (toggle: (val?: boolean) => void) =>
                      <TextInput
                        class="w-full" innerClass="h-42px!"
                        v-model:value={props.entryStates[PREFIX + 'Path2p'].value}
                        onFocus={() => paths.length > 0 && toggle(true)}
                      />,
                  }}
                </DropMenu>
              </div>
            </div>
          }
        </div>

        {/* remaining entries (e.g. radius) */}
        {props.section.entries?.filter(it => !knownPaths.includes(it.path!))
          .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
      </div>;
    };
  },
});
