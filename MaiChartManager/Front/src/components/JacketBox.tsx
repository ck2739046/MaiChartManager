import { computed, defineComponent, PropType, ref } from "vue";
import noJacket from "@/assets/noJacket.webp";
import api, { getUrl } from "@/client/api";
import { showTransactionalDialog } from "@munet/ui";
import { globalCapture, selectedADir, selectedMusic } from "@/store/refs";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import { useI18n } from 'vue-i18n';

export let upload = async (fileHandle?: FileSystemFileHandle) => {
}

export default defineComponent({
  props: {
    info: { type: Object as PropType<MusicXmlWithABJacket>, required: true },
    upload: { type: Boolean, default: true }
  },
  setup(props) {
    const updateTime = ref(0)
    const jacketUrl = computed(() => props.info.hasJacket ?
      getUrl(`GetJacketApi/${props.info.assetDir}/${props.info.id}?${updateTime.value}`) : noJacket)
    const { t } = useI18n();

    if (props.upload)
      upload = async (fileHandle?: FileSystemFileHandle) => {
        if (!props.upload) return;
        try {
          if (!fileHandle) {
            [fileHandle] = await window.showOpenFilePicker({
              id: 'jacket',
              startIn: 'downloads',
              types: [
                {
                  description: t('genre.imageDescription'),
                  accept: {
                    "application/jpeg": [".jpeg", ".jpg"],
                    "application/png": [".png"],
                  },
                },
              ],
            });
          }
          if (!fileHandle) return;
          const file = await fileHandle.getFile();

          const res = await api.SetMusicJacket(props.info.id!, selectedADir.value, { file });
          if (res.error) {
            const error = res.error as any;
            await showTransactionalDialog(t('jacket.setFailed'), error.message || error, undefined, true);
            return;
          }
          if (res.data) {
            await showTransactionalDialog(t('jacket.setFailed'), res.data, undefined, true);
            return;
          }
          updateTime.value = Date.now()
          props.info.hasJacket = true;
          selectedMusic.value!.hasJacket = true;
          (selectedMusic.value as any).updateTime = updateTime.value
        } catch (e: any) {
          if (e.name === 'AbortError') return
          console.log(e)
          globalCapture(e, t('jacket.replaceFailed'))
        }
      }

    return () => <img src={jacketUrl.value} class={`object-fill rounded-lg ${props.upload && 'cursor-pointer'}`} onClick={props.upload ? () => upload() : undefined} />
  }
})
