import { computed, defineComponent, ref, watch } from "vue";
import { Button, Modal, NumberInput, showTransactionalDialog } from "@munet/ui";
import { globalCapture, musicList, selectedADir, selectMusicId, updateAll } from "@/store/refs";
import api from "@/client/api";
import MusicIdConflictNotifier from "@/components/MusicIdConflictNotifier";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: Boolean,
  },
  setup(props, {emit}) {
    const show = computed({
      get: () => props.show,
      set: (val) => emit('update:show', val)
    })
    const id = ref(0);
    watch(() => show.value, val => {
      if (!val) return;
      id.value = selectMusicId.value;
    })
    const loading = ref(false);
    const { t } = useI18n();
    const save = async () => {
      if (musicList.value.find(it => it.id === id.value)) {
        const choice = await showTransactionalDialog(
          t('copy.idExists'),
          t('copy.idExistsConfirm'),
          [{ text: t('copy.overwrite'), action: true }, { text: t('common.cancel'), action: false }]
        );
        if (!choice) return;
      }
      if (Math.floor(id.value / 1e4) !== Math.floor(selectMusicId.value / 1e4)) {
        const choice = await showTransactionalDialog(
          t('copy.idTypeChangeWarningTitle'),
          t('copy.idTypeChangeWarning'),
          [{ text: t('purchase.continue'), action: true }, { text: t('common.cancel'), action: false }]
        );
        if (!choice) return;
      }
      try {
        loading.value = true;
        await api.ModifyId(selectMusicId.value, selectedADir.value, id.value);
        await updateAll();
        selectMusicId.value = id.value;
        show.value = false;
      } catch (e) {
        globalCapture(e, t('copy.changeIdError'));
      } finally {
        loading.value = false;
      }
    }

    return () => <Modal
      width="min(30vw,25em)"
      title={t('copy.changeId')}
      v-model:show={show.value}
    >{{
      default: () => <div class="flex flex-col gap-3">
        <div>
          <div class="ml-1 text-sm">{t('copy.newId')}</div>
          <div class="flex gap-2 items-center">
            <NumberInput v-model:value={id.value} class="w-full" min={1} max={999999}/>
            <MusicIdConflictNotifier id={id.value}/>
          </div>
        </div>
      </div>,
        actions: () => <>
          <Button class="w-0 grow" onClick={save} disabled={id.value === selectMusicId.value} ing={loading.value}>{t('common.confirm')}</Button>
        </>
    }}</Modal>;
  }
})
