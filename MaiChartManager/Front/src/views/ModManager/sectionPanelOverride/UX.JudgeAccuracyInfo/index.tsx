import { defineComponent, PropType, ref, computed } from 'vue';
import { IEntryState, ISectionState } from "@/client/apiGen";
import { Button } from '@munet/ui';
import api from "@/client/api";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    return () => <div class="flex gap-2 items-center m-l-35 translate-y--3">
      {t('mod.judgeAccuracyInfo.author')}Minepig
      <Button variant="secondary" onClick={() => api.OpenJudgeAccuracyInfoPdf()}>{t('mod.judgeAccuracyInfo.viewDoc')}</Button>
    </div>;
  },
});
