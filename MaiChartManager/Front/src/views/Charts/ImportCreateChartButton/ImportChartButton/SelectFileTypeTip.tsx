import { computed, defineComponent } from "vue";
import BottomOverlay from "@/components/BottomOverlay";
import FileTypeIcon from "@/components/FileTypeIcon";
import FileContentIcon from "@/components/FileContentIcon";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
    closeModal: {type: Function, required: true}
  },
  setup(props, {emit}) {
    const { t } = useI18n();

    return () => <BottomOverlay show={props.show} title={t('music.edit.selectFileTypes')}>
      <div class="flex flex-col gap-3 items-center">
        <div>{t('chart.import.folderHint')}</div>
        <div class="grid cols-[2fr_1fr] justify-items-center h-50 gap-5 w-50%">
          <div class="flex flex-col gap-1 items-center w-full">
            <FileContentIcon type="maidata"/>
            <span>maidata.txt</span>
          </div>
          <div class="grid rows-2">
            <div class="flex flex-col gap-1 items-center justify-center w-full">
              <FileTypeIcon type="mp3" class="text-16"/>
              <span>track.mp3</span>
            </div>
            <div class="flex flex-col gap-1 items-center justify-center w-full">
              <FileTypeIcon type="jpg" class="text-16"/>
              <span>bg.jpg / bg.png</span>
            </div>
          </div>
        </div>
      </div>
    </BottomOverlay>;
  }
})
