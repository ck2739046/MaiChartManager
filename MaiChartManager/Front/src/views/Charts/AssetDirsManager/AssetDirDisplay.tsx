import { computed, defineComponent, PropType, ref } from "vue";
import { GetAssetsDirsResult } from "@/client/apiGen";
import { Button, DropMenu, Modal, addToast, showTransactionalDialog, theme } from '@munet/ui';
import api from "@/client/api";
import { selectedADir, selectMusicId, updateAssetDirs, updateMusicList } from "@/store/refs";
import MemosDisplay from "@/views/Charts/AssetDirsManager/MemosDisplay";
import CheckContent from "@/views/Charts/AssetDirsManager/CheckConflictButton/CheckContent";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: { type: Object as PropType<GetAssetsDirsResult>, required: true },
    selected: { type: Boolean, default: false },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const showCheckConflict = ref(false);
    const hasDataConfig = computed(() => props.dir.subFiles!.some(it => it === 'DataConfig.xml'));
    const isOfficialChart = computed(() => props.dir.subFiles!.some(it => it === 'OfficialChartsMark.txt'));

    const toggleOfficialChart = async () => {
      if (isOfficialChart.value) {
        await api.DeleteAssetDirTxt({
          dirName: props.dir.dirName,
          fileName: 'OfficialChartsMark.txt'
        });
      } else {
        await api.PutAssetDirTxtValue({
          dirName: props.dir.dirName,
          fileName: 'OfficialChartsMark.txt',
          content: t('assetDir.aquaMaiMarkDesc')
        });
      }
      await updateAssetDirs();
    };

    const deleteDir = async () => {
      const confirmed = await showTransactionalDialog(
        t('assetDir.delete'),
        props.dir.dirName!,
        [{ text: t('common.confirm'), action: true }, { text: t('common.cancel'), action: false }]
      );
      if (!confirmed) return;
      const res = await api.DeleteAssetDir(props.dir.dirName!);
      if (res.error) {
        const error = res.error as any;
        addToast({ message: (error.message || error) as string, type: 'error' });
        return;
      }
      if (selectedADir.value === props.dir.dirName) {
        selectedADir.value = 'A000';
        selectMusicId.value = 0;
        await updateMusicList();
      }
      await updateAssetDirs();
    };

    const options = computed(() => [
      {
        label: t('assetDir.storing') + (isOfficialChart.value ? t('assetDir.officialChart') : t('assetDir.customChart')),
        ...(hasDataConfig.value
          ? { desc: t('assetDir.dataConfigExists'), disabled: true, action: () => {} }
          : { icon: 'i-material-symbols-repeat', action: toggleOfficialChart }),
      },
      {
        label: t('assetDir.checkConflict'),
        action: () => { showCheckConflict.value = true; },
      },
      {
        label: t('common.delete'),
        action: deleteDir,
      },
    ]);

    return () => (
      <div
        class={[
          "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer",
          props.selected && theme.value.listItem, theme.value.listItemHover,
        ]}
        onClick={() => emit('select')}
      >
        <div class="grow-1 min-w-0">
          <div class="truncate">
            {props.dir.dirName}
            <span class="op-70">{props.dir.version ? ` (Ver.${props.dir.version})` : ''}</span>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0" onClick={(e: Event) => e.stopPropagation()}>
          <MemosDisplay dir={props.dir} />
          {props.dir.dirName! !== 'A000' && (
            <DropMenu options={options.value} buttonText="">
              {{
                trigger: (toggle: (val?: boolean) => void) => (
                  <Button variant="secondary" onClick={() => toggle()}>
                    <span class="i-ic-baseline-more-vert text-lg" />
                  </Button>
                ),
              }}
            </DropMenu>
          )}
        </div>
        <Modal
          width="min(60vw,60em)"
          title={t('assetDir.conflictCheck')}
          v-model:show={showCheckConflict.value}
        >
          <CheckContent dir={props.dir.dirName!} />
        </Modal>
      </div>
    );
  }
})
