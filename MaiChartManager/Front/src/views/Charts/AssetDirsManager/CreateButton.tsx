import { Button, Modal, NumberInput, showTransactionalDialog } from "@munet/ui";
import { computed, defineComponent, PropType, ref } from "vue";
import { addVersionList, assetDirs, genreList, selectedADir, updateAddVersionList, updateAssetDirs, updateGenreList } from "@/store/refs";
import api from "@/client/api";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const show = ref(false);
    const { t } = useI18n();

    const id = ref(0)

    const setShow = () => {
      id.value = 0
      for (const {dirName} of assetDirs.value) {
        const exec = /A(\d{3})$/.exec(dirName!);
        if (!exec) continue;
        const num = parseInt(exec[1]);
        if (num > id.value) id.value = num;
      }
      id.value++;
      if (id.value > 999) {
        id.value = 999;
        while (assetDirs.value.find(v => v.dirName === `A${id.value.toString().padStart(3, '0')}`)) {
          id.value--;
        }
      }
      show.value = true
    }

    const save = async () => {
      if (id.value < 1 || id.value > 999) return;
      if (assetDirs.value.find(v => v.dirName === `A${id.value.toString().padStart(3, '0')}`)) {
        await showTransactionalDialog(t('message.notice'), t('assetDir.dirExists'), undefined, true);
        return;
      }
      show.value = false
      await api.CreateAssetDir(`A${id.value.toString().padStart(3, '0')}`);
      await updateAssetDirs();
    }

    return () => (
      <Button onClick={setShow}>
        {t('common.create')}

        <Modal
          width="min(30vw,25em)"
          title={t('assetDir.create')}
          v-model:show={show.value}
        >{{
          default: () =>
            <div class="flex gap-2 items-center">
              <span class="">A</span>
              <NumberInput v-model:value={id.value} class="w-full" min={1} max={999}/>
            </div>,
          actions: () =>
            <Button onClick={save}>{t('common.confirm')}</Button>
        }}</Modal>
      </Button>
    )
  }
})
