import { defineComponent, ref } from "vue";
import { Button, Modal } from '@munet/ui';
import CheckContent from "@/views/Charts/AssetDirsManager/CheckConflictButton/CheckContent";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: {type: String, required: true}
  },
  setup(props) {
    const show = ref(false);
    const { t } = useI18n();

    return () => <Button variant="secondary" onClick={() => show.value = true}>
      {t('assetDir.checkConflict')}

      <Modal
        width="min(60vw,60em)"
        title={t('assetDir.conflictCheck')}
        v-model:show={show.value}
      >
        <CheckContent dir={props.dir}/>
      </Modal>
    </Button>;
  }
})
