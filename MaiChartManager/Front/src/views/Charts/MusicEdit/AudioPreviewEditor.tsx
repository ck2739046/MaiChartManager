import { computed, defineComponent, onMounted, ref } from "vue";
import { Button, addToast } from "@munet/ui";
import WaveSurfer from "wavesurfer.js";
import { globalCapture, selectedADir, selectMusicId } from "@/store/refs";
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom'
import Hover from 'wavesurfer.js/dist/plugins/hover'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline'
import RegionsPlugin, { Region } from 'wavesurfer.js/dist/plugins/regions'
import api, { getUrl } from "@/client/api";
import { AudioPreviewTime } from "@/client/apiGen";
import { useMagicKeys } from "@vueuse/core";
import { t } from "@/locales";

export default defineComponent({
  props: {
    closeModel: {type: Function, required: true}
  },
  setup(props, {emit}) {
    const waveSurferContainer = ref()
    const region = ref<Region>()
    const ws = ref<WaveSurfer>()
    const isPlaying = ref(false)
    const isPlaySection = ref(false)
    const load = ref(false)
    const dataLoad = ref(true)
    const {ctrl, shift} = useMagicKeys()


    onMounted(async () => {
      dataLoad.value = true
      let savedRegion: AudioPreviewTime | null = null
      try {
        const req = await api.GetAudioPreviewTime(selectMusicId.value, selectedADir.value)
        savedRegion = req.data
        if (savedRegion.startTime! >= savedRegion.endTime!) {
          throw new Error(t('music.edit.audioPreviewError'))
        }
      } catch (e) {
        savedRegion = {startTime: -1, endTime: -1}
      }

      const regions = RegionsPlugin.create()
      ws.value = WaveSurfer.create({
        container: waveSurferContainer.value,
        waveColor: 'rgb(107,203,152)',
        progressColor: 'rgb(33,194,118)',
        url: getUrl(`GetMusicWavApi/${selectedADir.value}/${selectMusicId.value}`),
        plugins: [
          regions,
          ZoomPlugin.create({
            scale: 0.05
          }),
          Hover.create({
            lineColor: 'rgba(89,89,89,0.8)',
          }),
          TimelinePlugin.create()
        ],
      })

      ws.value.on('decode', (duration) => {
        // Regions
        region.value = regions.addRegion({
          start: savedRegion!.startTime! >= 0 ? savedRegion.startTime! : 0,
          end: savedRegion!.endTime! >= 0 ? savedRegion.endTime! : duration,
          drag: true,
          resize: true,
          id: 'selection',
        })
      })

      ws.value.on('click', (e) => {
        const time = ws.value?.getDuration()! * e;
        if (ctrl.value) {
          if (time >= region.value!.end) {
            addToast({message: t('music.edit.audioPreviewStartGtEnd'), type: 'warning'})
            return
          }
          region.value!.setOptions({start: time})
        } else if (shift.value) {
          if (time <= region.value!.start) {
            addToast({message: t('music.edit.audioPreviewEndLtStart'), type: 'warning'})
            return
          }
          region.value!.setOptions({end: time, start: region.value!.start})
        }
      })

      regions.on("region-out", () => {
        if (isPlaySection.value)
          region.value?.play();
      })

      ws.value.on('finish', () => {
        isPlaying.value = false
      })
      dataLoad.value = false
    })

    const save = async () => {
      load.value = true
      try {
        await api.SetAudioPreview(selectMusicId.value, selectedADir.value, {startTime: region.value!.start, endTime: region.value!.end})
        props.closeModel()
      } catch (e) {
        globalCapture(e, t('music.edit.audioPreviewSaveFailed'))
      } finally {
        load.value = false
      }
    }

    const playIcon = computed(() => isPlaying.value ? 'i-mdi-pause' : 'i-mdi-play')

    return () => <div class="relative">
      {dataLoad.value && <div class="absolute inset-0 flex items-center justify-center bg-black/10 z-10"><div class="i-mdi-loading animate-spin text-2xl"/></div>}
      <div class="flex flex-col gap-3">
        {t('music.edit.audioPreviewCtrlShiftClick')}
        <div ref={waveSurferContainer}/>
        <div class="flex gap-2 justify-center">
          <Button variant="secondary" onClick={() => {
            isPlaySection.value = false
            if (isPlaying.value) ws.value?.pause()
            else ws.value?.play()
            isPlaying.value = !isPlaying.value
          }}>
            <span class={`text-lg ${playIcon.value}`}/>
          </Button>
          <Button variant="secondary" onClick={() => {
            isPlaySection.value = true
            isPlaying.value = true
            region.value?.play()
          }}>
            <span class="i-mdi-play text-lg m-r-2"/>
            {t('music.edit.audioPreviewSelectRegion')}
          </Button>
        </div>
        <div class="flex gap-2 justify-end">
          <Button variant="secondary" danger onClick={props.closeModel as any} disabled={load.value}>
            {t('common.dismiss')}
          </Button>
          <Button variant="secondary" onClick={save} ing={load.value}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </div>;
  }
})
