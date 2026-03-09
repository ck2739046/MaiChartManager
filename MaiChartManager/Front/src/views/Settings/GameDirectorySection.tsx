import { defineComponent, ref, onMounted } from "vue";
import { Button, Section } from "@munet/ui";
import { theme } from "@munet/ui";
import { useI18n } from "vue-i18n";
import api from "@/client/api";
import { updateAll } from "@/store/refs";

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const gamePath = ref('');
    const switching = ref(false);
    const error = ref('');
    const historyPaths = ref<string[]>([]);

    onMounted(async () => {
      try {
        const res = await api.GetGamePath();
        gamePath.value = res.data || '';
      } catch {}
      try {
        const res = await api.GetGamePathHistory();
        historyPaths.value = res.data || [];
      } catch {}
    });

    const handleChangeDirectory = async () => {
      error.value = '';
      try {
        const res = await api.OpenFolderDialog();
        if (!res.data) return;
        switching.value = true;
        await api.SetGamePath(res.data, {save: true});
        await api.InitializeGameData();
        await updateAll();
        gamePath.value = res.data;
        if (!historyPaths.value.includes(res.data)) {
          historyPaths.value.push(res.data);
        }
      } catch (e: any) {
        error.value = t('settings.changeDirectoryFailed');
      } finally {
        switching.value = false;
      }
    };

    const handleSwitchToHistory = async (path: string) => {
      if (path === gamePath.value) return;
      error.value = '';
      switching.value = true;
      try {
        await api.SetGamePath(path, {save: true});
        await api.InitializeGameData();
        await updateAll();
        gamePath.value = path;
      } catch {
        error.value = t('settings.changeDirectoryFailed');
      } finally {
        switching.value = false;
      }
    };

    const handleDeleteHistory = async (path: string) => {
      try {
        await api.DeleteGamePathHistory(path);
        historyPaths.value = historyPaths.value.filter(p => p !== path);
      } catch {}
    };

    return () => (
      <div class="mb-6">
        <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.gameDirectory')}</div>
        <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
          <div class="flex items-center gap-3">
            <span class="shrink-0 op-60">{t('settings.currentPath')}</span>
            <span class="text-sm break-all">{gamePath.value || '—'}</span>
          </div>
          <div class="flex items-center gap-3">
            <Button
              disabled={switching.value}
              onClick={handleChangeDirectory}
              ing={switching.value}
            >
              {t('settings.changeDirectory')}
            </Button>
            <button
              onClick={()=>api.SwitchToSetMode()}
            >
              {t('settings.switchMode')}
            </button>
            {error.value && <span class="text-red-500 text-sm">{error.value}</span>}
          </div>
          {/* History */}
          <Section title={t('settings.historyPath')} icon="i-solar:history-linear">
            {historyPaths.value.length === 0
              ? <span class="text-sm op-50">{t('settings.noHistory')}</span>
              : historyPaths.value.map(path => (
                <div
                  class={[
                    'flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer',
                    theme.value.listItemHover,
                    path === gamePath.value && theme.value.listItem,
                  ]}
                  key={path}
                  onClick={() => handleSwitchToHistory(path)}
                >
                  <div class="i-material-symbols:folder-outline-rounded text-lg op-70 shrink-0" />
                  <span class="text-sm break-all grow">{path}</span>
                  <button
                    onClick={(e: Event) => { e.stopPropagation(); handleDeleteHistory(path); }}
                  >
                    <div class="i-tabler:trash text-base op-80 text-sm" />
                  </button>
                </div>
              ))
            }
          </Section>
        </div>
      </div>
    );
  },
});
