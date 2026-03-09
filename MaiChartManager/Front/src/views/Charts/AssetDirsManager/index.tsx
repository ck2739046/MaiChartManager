import { defineComponent } from "vue";
import { Button } from "@munet/ui";
import { assetDirs, selectedADir, selectMusicId } from "@/store/refs";
import AssetDirDisplay from "@/views/Charts/AssetDirsManager/AssetDirDisplay";
import CreateButton from "./CreateButton";
import ImportLocalButton from "./ImportLocalButton";
import { useI18n } from 'vue-i18n';
import { leftPanel } from "@/views/Charts/refs";

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const selectDir = (dirName: string) => {
      selectedADir.value = dirName;
      selectMusicId.value = 0;
      leftPanel.value = 'musicList';
    };

    return () => (
      <div class="flex flex-col gap-3 h-full p-xy">
        <div class="flex items-center gap-2">
          <Button variant="secondary" onClick={() => leftPanel.value = 'musicList'}>
            <span class="i-ic-baseline-arrow-back text-lg" />
          </Button>
          <div class="font-medium">{t('assetDir.title')}</div>
          <div class="grow-1" />
          <CreateButton />
          <ImportLocalButton />
        </div>
        <div class="of-y-auto cst flex-1">
          <div class="flex flex-col gap-1">
            {assetDirs.value.map(it => (
              <AssetDirDisplay
                dir={it}
                key={it.dirName!}
                selected={selectedADir.value === it.dirName}
                onSelect={() => selectDir(it.dirName!)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
})
