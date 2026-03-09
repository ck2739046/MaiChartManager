import { defineComponent, PropType } from 'vue';
import { useVModel } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import RefreshAllButton from './RefreshAllButton';
import VersionInfo from '@/components/VersionInfo';
import { shouldShowUpdate as aquaMaiHasUpdate } from '@/views/ModManager/shouldShowUpdateController';

export type SidebarItem = 'charts' | 'mods' | 'batch' | 'genres' | 'tools' | 'settings';

const items: { key: SidebarItem; icon: string; labelKey: string; badge?: () => boolean }[] = [
  { key: 'charts', icon: 'i-mdi-music-note', labelKey: 'sidebar.charts' },
  { key: 'mods', icon: 'i-mdi:puzzle', labelKey: 'sidebar.mods', badge: () => aquaMaiHasUpdate.value },
  { key: 'batch', icon: 'i-mdi-playlist-edit', labelKey: 'sidebar.batch' },
  { key: 'genres', icon: 'i-mdi-tag-multiple', labelKey: 'sidebar.genres' },
  { key: 'tools', icon: 'i-ri:tools-fill', labelKey: 'sidebar.tools' },
];

export default defineComponent({
  props: {
    active: {
      type: String as PropType<SidebarItem>,
      default: 'charts',
    },
  },
  emits: ['update:active'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const active = useVModel(props, 'active', emit);


    const renderItem = (key: SidebarItem, icon: string, labelKey: string, desktop: boolean, badge?: boolean) => (
      <div
        key={key}
        class={[
          desktop ? 'w-15 h-15' : 'w-12 h-12',
          'flex items-center justify-center rounded-md cursor-pointer shrink-0',
          'transition-all duration-200 border-none bg-transparent relative group',
          active.value === key
            ? 'bg-[var(--link-color)]/12 text-[var(--link-color)]'
            : 'text-gray-500 bg-avatarMenuButton hover:text-gray-700',
        ]}
        onClick={() => (active.value = key)}
      >
        {active.value === key && desktop && (
          <div class="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-full bg-[var(--link-color)]" />
        )}
        {active.value === key && !desktop && (
          <div class="absolute bottom-0 left-1.5 right-1.5 h-0.75 rounded-t-full bg-[var(--link-color)]" />
        )}
        <span class={[icon, 'text-6']} />
        {badge && <div class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 pointer-events-none" />}
        <span class={[
          'absolute px-3 py-1.5 rounded-lg bg-[oklch(0.7_0.13_var(--hue))] text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-100',
          desktop ? 'left-full ml-2' : 'max-[439px]:hidden bottom-full mb-2 left-1/2 -translate-x-1/2',
        ]}>{t(labelKey)}</span>
      </div>
    );

    return () => (
      <>
        {/* Desktop sidebar */}
        <div class="hidden md:flex w-16 flex-col items-center py-2 gap-1 h-100dvh shrink-0 border-r border-r-[oklch(0.9_0.02_var(--hue))] border-r-solid bg-[oklch(0.98_0.01_var(--hue))] z-20 relative cst">
          {items.map((item) => renderItem(item.key, item.icon, item.labelKey, true, item.badge?.()))}
          <div class="mt-auto" />
          {renderItem('settings', 'i-mdi-cog', 'sidebar.settings', true)}
          <RefreshAllButton />
          <VersionInfo />
        </div>

        {/* Mobile bottom bar */}
        <div class={[
          'md:hidden fixed bottom-0 left-0 right-0 z-50',
          'flex items-center h-14 gap-1 px-1',
          'max-[439px]:of-x-auto max-[439px]:of-y-hidden max-[439px]:cst',
          'min-[440px]:justify-center',
          'bg-[oklch(0.98_0.01_var(--hue))] border-t border-t-[oklch(0.9_0.02_var(--hue))] border-t-solid',
        ]}>
          {items.map((item) => renderItem(item.key, item.icon, item.labelKey, false, item.badge?.()))}
          {renderItem('settings', 'i-mdi-cog', 'sidebar.settings', false)}
          <RefreshAllButton />
          <VersionInfo />
        </div>
      </>
    );
  },
});
