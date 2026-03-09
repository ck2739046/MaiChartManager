import { computed, defineComponent, ref, watch } from "vue";
import { Range, Select } from "@munet/ui";
import { selectedThemeHue } from "@munet/ui";
import { useI18n } from "vue-i18n";
import { setLocale, availableLocales, locale } from '@/locales/index';
import type { Locale } from '@/locales/index';
import styles from "./ThemeSlider.module.scss";
import { appSettings } from "@/store/settings";
import { isWebView } from "@/client/api";

function postZoomMessage(value: number) {
  (window as any).chrome.webview.postMessage({ type: 'setZoom', value });
}

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const uiZoom = ref<number>(appSettings.value.uiZoom ?? 0);
    watch(appSettings, (newVal) => {
      uiZoom.value = newVal.uiZoom ?? 0;
    }, { immediate: true });

    const autoZoom = computed(() => Math.round((appSettings.value.targetDpiScale || 1) * 100) || 100)
    const zoomDisplay = computed({
      get: () => uiZoom.value || autoZoom.value,
      set: (v: number) => {
        uiZoom.value = v;
        postZoomMessage(v);
      }
    })

    const localeLabels: Record<Locale, string> = {
      'zh': '简体中文',
      'zh-TW': '繁體中文',
      'en': 'English',
    };
    const localeOptions = availableLocales.map(l => ({
      label: localeLabels[l],
      value: l,
    }));

    return () => (
      <div class="mb-6">
        <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.appearance')}</div>
        <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
          <div class="flex items-center gap-3">
            <div class="i-mdi-translate text-xl op-60" />
            <Select
              value={locale.value}
              options={localeOptions}
              onChange={(v: any) => setLocale(v as Locale)}
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={selectedThemeHue.value}
              onInput={(e) => { selectedThemeHue.value = Number((e.target as HTMLInputElement).value); }}
              class={[styles['chromatic-hue-slider'], 'w-full']}
            />
            <button class="shrink-0"
              onClick={() => { selectedThemeHue.value = 353; }}
            >
              {t('settings.resetDefault')}
            </button>
          </div>
          {isWebView && (
            <div class="flex items-center gap-2">
              <span class="shrink-0">{t('settings.zoom')}</span>
              <Range
                min={50}
                max={250}
                step={5}
                v-model={zoomDisplay.value}
                origin={autoZoom.value}
                class="w-full"
              />
              <span class="ml-auto shrink-0 text-sm op-60 w-12">
                {uiZoom.value === 0 ? t('settings.zoomAuto') : `${uiZoom.value}%`}
              </span>
              <button class="shrink-0"
                onClick={() => { uiZoom.value = 0; postZoomMessage(0); }}
              >
                {t('settings.resetDefault')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
});
