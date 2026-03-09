import { Button, Modal } from "@munet/ui";
import { defineComponent, ref } from "vue";
import AudioPreviewEditor from "@/views/Charts/MusicEdit/AudioPreviewEditor";
import { showNeedPurchaseDialog, version } from "@/store/refs";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    disabled: Boolean,
  },
  setup(props) {
    const show = ref(false)
    const { t } = useI18n();

    const handleClick = () => {
      if (version.value?.license !== 'Active') {
        showNeedPurchaseDialog.value = true
        return
      }
      show.value = true
    }

    return () => <Button variant="secondary" onClick={handleClick} disabled={props.disabled}>
      {t('music.edit.editPreview')}

      <Modal
        width="min(60vw,80em)"
        title={t('music.edit.editPreview')}
        v-model:show={show.value}
        esc={false}
      >{{
        default: () =>
          <AudioPreviewEditor closeModel={() => show.value = false}/>,
      }}</Modal>
    </Button>;
  }
})
