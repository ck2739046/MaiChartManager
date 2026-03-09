import { computed, defineComponent, ref } from "vue";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import { Button, Select, theme } from "@munet/ui";
import { VList } from 'virtua/vue';
import MusicEntry from "@/views/Charts/MusicList/MusicEntry";
import { assetDirs, musicList, musicSortMode, MusicSortMode, selectedADir, selectMusicId } from "@/store/refs";
import { leftPanel } from "@/views/Charts/refs";
import { useI18n } from 'vue-i18n';


export const musicListRef = ref<InstanceType<typeof VList> | null>(null);

export const scrollToMusic = (musicId: number) => {
  const idx = musicList.value.findIndex(m => m.id === musicId);
  if (idx === -1 || !musicListRef.value) return;
  musicListRef.value.scrollToIndex(idx, { align: 'center', smooth: true });
};

export default defineComponent({
  props: {
    toggleMenu: { type: Function, required: true },
  },
  setup(props) {
    const { t } = useI18n();
    const sortOptions = computed(() => [
      { label: t('music.list.sortById'), value: 'id' as MusicSortMode },
      { label: t('music.list.sortByName'), value: 'name' as MusicSortMode },
      { label: t('music.list.sortByVersion'), value: 'version' as MusicSortMode },
    ]);
    const selectedDirLabel = () => {
      const dir = assetDirs.value.find(d => d.dirName === selectedADir.value);
      if (!dir) return selectedADir.value;
      return <>{dir.dirName}<span class="op-70">{dir.version ? ` (Ver.${dir.version})` : ''}</span></>;
    };

    return () => (
      <div class="flex flex-col gap-3 h-full p-xy">
        <div class="flex items-center gap-2">
          <Button variant="secondary" onClick={() => props.toggleMenu()} class="min-[1440px]:hidden">
            <span class="i-ic-baseline-menu text-lg" />
          </Button>
          <div
            class={["grow w-0 flex items-center gap-1 px-3 py-1.5 rounded-12px transition-colors text-left truncate cursor-pointer border-none h-48px", theme.value.listItem, theme.value.listItemHover]}
            onClick={() => leftPanel.value = 'assetDirs'}
          >
            <span class="truncate">{selectedDirLabel()}</span>
          </div>
          <Select
            v-model:value={musicSortMode.value}
            options={sortOptions.value}
            class="w-40! shrink-0"
          />
        </div>
        <VList ref={musicListRef} class="flex-1 cst" data={musicList.value}>
          {({item}: {item: MusicXmlWithABJacket}) => (
            <MusicEntry music={item} selected={selectMusicId.value === item.id} onClick={() => selectMusicId.value = item.id!} key={item.id} />
          )}
        </VList>
      </div>
    )
  }
})
