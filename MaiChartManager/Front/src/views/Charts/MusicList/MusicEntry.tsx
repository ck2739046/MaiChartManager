import { computed, defineComponent, PropType } from "vue";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import noJacket from '@/assets/noJacket.webp';
import { DIFFICULTY } from "@/consts";
import ProblemsDisplay from "@/components/ProblemsDisplay";
import { musicListAll, selectedADir } from "@/store/refs";
import ConflictDisplay from "@/views/Charts/MusicList/ConflictDisplay";
import { getUrl } from "@/client/api";
import LongMusicIcon from "./LongMusicIcon";
import LevelTagsDisplay from "@/components/LevelTagsDisplay";
import { theme } from "@munet/ui";

export default defineComponent({
  props: {
    music: { type: Object as PropType<MusicXmlWithABJacket>, required: true },
    selected: Boolean,
    onClick: Function as PropType<() => any>,
  },

  setup(props) {
    const jacketUrl = computed(() => props.music.hasJacket ?
      getUrl(`GetJacketApi/${selectedADir.value}/${props.music.id}?${(props.music as any).updateTime}`) : noJacket)

    const overridingOthers = computed(() => musicListAll.value.filter(m => m.id === props.music.id && m.assetDir! < props.music.assetDir!))
    const overrideByOthers = computed(() => musicListAll.value.filter(m => m.id === props.music.id && m.assetDir! > props.music.assetDir!))

    const problems = computed(() => {
      const res = [...props.music.problems || []];
      for (let i = 0; i < 5; i++) {
        if (props.music.charts?.[i]?.enable) {
          res.push(...(props.music.charts?.[i]?.problems || []).map(p => `[${DIFFICULTY[i]}] ${p}`));
        }
      }
      return res;
    })

    return () => (
      <div class={[`flex gap-5 h-20 w-full p-2 m-y-1 rd-md relative`, theme.value.listItemHover, props.selected && theme.value.listItem]} onClick={props.onClick} title={props.music.name!}>
        <img src={jacketUrl.value} class="h-16 w-16 object-fill shrink-0" key={props.music.id} />
        <div class="flex flex-col grow-1 w-0">
          <div class="flex items-center gap-1 text-xs c-gray-5">
            {props.music.modified && <span class="inline-block w-2 h-2 rounded-full bg-yellow-500" />}
            {props.music.id?.toString().padStart(6, '0')}
          </div>
          <div class="text-ellipsis of-hidden ws-nowrap">{props.music.name}</div>
          <LevelTagsDisplay charts={props.music.charts!}></LevelTagsDisplay>
        </div>
        <div class="flex gap-1 absolute right-0 bottom-0 mr-2 mb-2">
          {props.music.longMusic && <LongMusicIcon />}
          <ConflictDisplay conflicts={overridingOthers.value} type="up" />
          <ConflictDisplay conflicts={overrideByOthers.value} type="down" />
          <ProblemsDisplay problems={problems.value} />
        </div>
      </div>
    )
  }
});
