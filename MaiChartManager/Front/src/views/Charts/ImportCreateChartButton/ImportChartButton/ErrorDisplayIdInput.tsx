import { computed, defineComponent, effect, PropType, watch } from "vue";
import { Button, CheckBox, Modal, NumberInput, Section } from "@munet/ui";
import { ImportChartMessage, MessageLevel, ShiftMethod } from "@/client/apiGen";
import { ImportChartMessageEx, ImportMeta, SavedOptions, TempOptions } from "./types";
import noJacket from '@/assets/noJacket.webp';
import { addVersionList, genreList, showNeedPurchaseDialog } from "@/store/refs";
import GenreInput from "@/components/GenreInput";
import VersionInput from "@/components/VersionInput";
import { UTAGE_GENRE } from "@/consts";
import MusicIdConflictNotifier from "@/components/MusicIdConflictNotifier";
import { useI18n } from 'vue-i18n';
import ImportAlert from "@/views/Charts/ImportCreateChartButton/ImportChartButton/ImportAlert";
import ShiftModeSelector from "@/views/Charts/ImportCreateChartButton/ImportChartButton/ShiftModeSelector";

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
    meta: {type: Array as PropType<ImportMeta[]>, required: true},
    tempOptions: {type: Object as PropType<TempOptions>, required: true},
    savedOptions: {type: Object as PropType<SavedOptions>, required: true},
    closeModal: {type: Function, required: true},
    proceed: {type: Function as PropType<() => any>, required: true},
    errors: {type: Array as PropType<ImportChartMessageEx[]>, required: true}
  },
  setup(props, {emit}) {
    const { t } = useI18n();

    const show = computed({
      get: () => props.show,
      set: (val) => props.closeModal()
    })

    watch([() => props.savedOptions.genreId, () => show.value], ([val]) => {
      for (const meta of props.meta) {
        meta.id = meta.id % 1e5 + (val === UTAGE_GENRE ? 1e5 : 0);
      }
    })

    return () => <Modal
      width="min(50vw,50em)"
      title={t('chart.import.importPrompt')}
      v-model:show={show.value}
    >{{
      default: () => <div class="flex flex-col gap-3">
        <ImportAlert errors={props.errors} tempOptions={props.tempOptions}></ImportAlert>
        {!!props.meta.length && <>
            {t('chart.import.assignId')}
            <div class="of-y-auto cst max-h-24vh">
                <div class="flex flex-col gap-3">
                  {props.meta.map((meta, i) => <MusicIdInput key={i} meta={meta} utage={props.savedOptions.genreId === UTAGE_GENRE}/>)}
                </div>
            </div>
            <div>
              <div class="ml-1 text-sm">{t('music.edit.genre')}</div>
              <GenreInput options={genreList.value} v-model:value={props.savedOptions.genreId}/>
            </div>
            <div>
              <div class="ml-1 text-sm">{t('music.edit.versionCategory')}</div>
              <GenreInput options={addVersionList.value} v-model:value={props.savedOptions.addVersionId}/>
            </div>
            <div>
              <div class="ml-1 text-sm">{t('music.edit.version')}</div>
              <VersionInput v-model:value={props.savedOptions.version}/>
            </div>
            <CheckBox v-model:value={props.tempOptions.ignoreLevel}>
                {t('settings.ignoreLevel')}
            </CheckBox>
            <CheckBox v-model:value={props.tempOptions.disableBga}>
                {t('settings.disableBga')}
            </CheckBox>
            <Section title={t('chart.import.option.advancedOptions')}>
                <ShiftModeSelector tempOptions={props.tempOptions}></ShiftModeSelector>
            </Section>
        </>}
      </div>,
        actions: () => <>
          <Button class="w-0 grow" onClick={() => show.value = false}>{props.meta.length ? t('common.cancel') : t('common.close')}</Button>
          {!!props.meta.length && <Button class="w-0 grow" onClick={props.proceed}>{t('purchase.continue')}</Button>}
        </>
    }}</Modal>;
  }
})

const MusicIdInput = defineComponent({
  props: {
    meta: {type: Object as PropType<ImportMeta>, required: true},
    utage: {type: Boolean, required: true},
  },
  setup(props) {
    const dxBase = computed(() => {
      const dx = props.meta.isDx ? 1e4 : 0
      const utage = props.utage ? 1e5 : 0
      return dx + utage;
    });
    const img = computed(() => props.meta.bg ? URL.createObjectURL(props.meta.bg) : noJacket);

    return () => <div class="flex gap-3 items-center px of-hidden">
      <img src={img.value} class="h-16 w-16 object-fill shrink-0"/>
      <div class="w-0 grow">{props.meta.name}</div>
      <MusicIdConflictNotifier id={props.meta.id}/>
      <NumberInput v-model:value={props.meta.id} min={dxBase.value + 1} max={dxBase.value + 1e4 - 1} step={1} class="shrink-0"/>
    </div>
  }
})
