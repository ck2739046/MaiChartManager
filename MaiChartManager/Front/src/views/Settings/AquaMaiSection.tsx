import { defineComponent } from "vue";
import { Radio } from "@munet/ui";
import { useI18n } from "vue-i18n";
import { selectedChannel, isMuModMode } from "@/views/ModManager/shouldShowUpdateController";

export default defineComponent({
  setup() {
    const { t } = useI18n();

    return () => {
      if (isMuModMode.value) return null;
      return (
      <div class="mb-6">
        <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">AquaMai</div>
        <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
          <div class="flex gap-3">
            <span class="shrink-0 flex justify-end">{t('settings.updateChannel')}</span>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-3">
                <Radio k={'slow'} v-model:value={selectedChannel.value}>{t('settings.updateChannelSlow')}</Radio>
                <Radio k={'ci'} v-model:value={selectedChannel.value}>{t('settings.updateChannelCi')}</Radio>
              </div>
              <span class="text-sm op-60">{t('settings.updateChannelDesc')}</span>
            </div>
          </div>
        </div>
      </div>
      );
    };
  },
});
