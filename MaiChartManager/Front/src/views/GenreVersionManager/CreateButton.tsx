import { Button, Modal, NumberInput, Select, showTransactionalDialog } from "@munet/ui";
import { computed, defineComponent, PropType, ref } from "vue";
import { addVersionList, assetDirs, genreList, selectedADir, updateAddVersionList, updateGenreList } from "@/store/refs";
import api from "@/client/api";
import { EDIT_TYPE } from "./index";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    setEditId: {type: Function as PropType<(id: number) => any>, required: true},
    type: Number as PropType<EDIT_TYPE>,
  },
  setup(props) {
    const show = ref(false);
    const { t } = useI18n();
    const text = computed(() => props.type === EDIT_TYPE.Genre ? t('genre.title') : t('version.title'));
    const list = props.type === EDIT_TYPE.Genre ? genreList : addVersionList;

    const assetDir = ref('')
    const id = ref(0)

    const setShow = () => {
      assetDir.value = selectedADir.value;
      for (let i = 100; i < 1000; i++) {
        if (list.value.some(it => it.id === i)) continue
        id.value = i;
        break;
      }
      show.value = true
    }

    const save = async () => {
      show.value = false
      const res = await (props.type === EDIT_TYPE.Genre ? api.AddGenre : api.AddVersion)({
        assetDir: assetDir.value,
        id: id.value,
      });
      if (res.error) {
        const error = res.error as any;
        await showTransactionalDialog(t('genre.createFailed'), error.message || error, undefined, true);
        return;
      }
      if (res.data) {
        await showTransactionalDialog(t('genre.createFailed'), res.data, undefined, true);
        return;
      }
      await updateAddVersionList();
      await updateGenreList();
      props.setEditId(id.value);
    }

    return () => (
      <Button onClick={setShow}>
        {t('common.create')}

        <Modal
          width="min(30vw,25em)"
          title={`${t('common.create')}${text.value}`}
          v-model:show={show.value}
        >{{
          default: () => <div class="flex flex-col gap-3">
            <div>
              <div class="ml-1 text-sm">ID</div>
              <NumberInput v-model:value={id.value} class="w-full" min={1}/>
            </div>
            <div>
              <div class="ml-1 text-sm">Opt</div>
              <Select
                v-model:value={assetDir.value}
                options={assetDirs.value.filter(it => it.dirName !== 'A000').map(dir => ({label: dir.dirName!, value: dir.dirName!}))}
              />
            </div>
          </div>,
          actions: () => <>
            <Button onClick={save}>{t('common.confirm')}</Button>
          </>
        }}</Modal>
      </Button>
    )
  }
})
