import { defineComponent, PropType, ref } from "vue";
import { Button, CheckBox, Select } from "@munet/ui";
import GenreInput from "@/components/GenreInput";
import { addVersionList, genreList, globalCapture, selectedADir, selectMusicId, updateMusicList, version } from "@/store/refs";
import api from "@/client/api";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import { useI18n } from 'vue-i18n';

enum VERSION_OPTION {
  NotChange,
  B35,
  B15
}

export default defineComponent({
  props: {
    closeModal: {type: Function, required: true},
    selectedMusicIds: {type: Array as PropType<MusicXmlWithABJacket[]>, required: true}
  },
  setup(props) {
    const versionOpt = ref(VERSION_OPTION.NotChange);
    const addVersion = ref(-1);
    const genre = ref(-1);
    const removeLevels = ref(false);
    const loading = ref(false);
    const { t } = useI18n();
    
    const versionOptions = [
      {label: t('music.batch.notChange'), value: VERSION_OPTION.NotChange},
      {label: 'B35', value: VERSION_OPTION.B35},
      {label: 'B15', value: VERSION_OPTION.B15},
    ];

    const save = async () => {
      loading.value = true;
      try {
        let newVersion = -1;
        if (versionOpt.value === VERSION_OPTION.B35) {
          newVersion = 20000;
        } else if (versionOpt.value === VERSION_OPTION.B15) {
          newVersion = version.value!.gameVersion! * 100 + 20000;
        }
        await api.BatchSetProps({
          ids: props.selectedMusicIds.map(id => ({id: id.id, assetDir: id.assetDir})),
          genreId: genre.value,
          version: newVersion,
          addVersionId: addVersion.value,
          removeLevels: removeLevels.value
        })
        props.closeModal();
        selectMusicId.value = 0;
        updateMusicList();
      } catch (e) {
        globalCapture(e, t('music.batch.editFailed'));
      } finally {
        loading.value = false;
      }
    }

    return () => <fieldset disabled={loading.value}>
      <div class="flex flex-col gap-2">
        <div>
          <div class="ml-1 text-sm">{t('music.edit.version')}</div>
          <Select v-model:value={versionOpt.value} options={versionOptions}/>
        </div>
        <div>
          <div class="ml-1 text-sm">{t('music.edit.genre')}</div>
          <GenreInput options={[
            {id: -1, genreName: t('music.batch.notChange')},
            ...genreList.value
          ]} v-model:value={genre.value}/>
        </div>
        <div>
          <div class="ml-1 text-sm">{t('music.edit.versionCategory')}</div>
          <GenreInput options={[
            {id: -1, genreName: t('music.batch.notChange')},
            ...addVersionList.value
          ]} v-model:value={addVersion.value}/>
        </div>
        <CheckBox v-model:value={removeLevels.value}>{t('music.batch.removeLevels')}</CheckBox>
        <div class="flex justify-end">
          <Button ing={loading.value} onClick={save}>{t('common.save')}</Button>
        </div>
      </div>
    </fieldset>
  }
})
