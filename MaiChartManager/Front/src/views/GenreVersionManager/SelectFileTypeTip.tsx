import { computed, defineComponent } from "vue";
import BottomOverlay from "@/components/BottomOverlay";
import FileTypeIcon from "@/components/FileTypeIcon";
import FileContentIcon from "@/components/FileContentIcon";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
  },
  setup(props, {emit}) {
    const { t } = useI18n();
    
    return () => <BottomOverlay show={props.show} title={t('music.edit.selectFileTypes')}>
      <div class="flex flex-col gap-3 items-center">
        <div>{t('genre.imageHint')}</div>
        <div class="grid cols-4 justify-items-center text-8em gap-10">
          <FileTypeIcon type="JPG"/>
          <FileTypeIcon type="PNG"/>
        </div>
      </div>
    </BottomOverlay>;
  }
})
