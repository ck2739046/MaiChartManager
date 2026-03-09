import { defineComponent, PropType, ref, computed, watch } from 'vue';
import { ConfigDto } from "@/client/apiGen";
import { TextInput, theme, WhateverNaviBar } from '@munet/ui';
import _ from "lodash";
import configSortStub from './configSort.yaml'
import { useMagicKeys, whenever } from "@vueuse/core";
import { getBigSectionName } from './utils';
import { useI18n } from 'vue-i18n';
import ConfigSection from './ConfigSection';

export default defineComponent({
  props: {
    config: { type: Object as PropType<ConfigDto>, required: true },
    useNewSort: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const search = ref('');
    const searchRef = ref();
    const activeTab = ref<string | null>(null);
    const scrollContainerRef = ref<HTMLElement>();
    const configSort = computed(() => props.config?.configSort || configSortStub)
    const communityList = computed(() => configSort.value['社区功能'] || []);
    const { t } = useI18n();

    const { ctrl_f } = useMagicKeys({
      passive: false,
      onEventFired(e) {
        if (e.ctrlKey && e.key === 'f' && e.type === 'keydown')
          e.preventDefault()
      },
    })
    whenever(ctrl_f, () => searchRef.value?.select());

    const filteredSections = computed(() => {
      if (!search.value) return props.config?.sections;
      const s = search.value.toLowerCase();
      return props.config.sections?.filter(it =>
        it.path?.toLowerCase().includes(s) ||
        it.attribute?.comment?.nameZh?.toLowerCase().includes(s) ||
        it.attribute?.comment?.commentZh?.toLowerCase().includes(s) ||
        it.attribute?.comment?.commentEn?.toLowerCase().includes(s) ||
        it.entries?.some(entry => entry.name?.toLowerCase().includes(s) || entry.path?.toLowerCase().includes(s) ||
          entry.attribute?.comment?.commentZh?.toLowerCase().includes(s) || entry.attribute?.comment?.commentEn?.toLowerCase().includes(s) ||
          entry.attribute?.comment?.nameZh?.toLowerCase().includes(s))
      );
    })

    const bigSections = computed(() => {
      if (props.useNewSort) {
        return Object.keys(configSort.value).filter(it => it !== '社区功能').filter(it => filteredSections.value?.some(s => configSort.value[it].includes(s.path!)) ?? false);
      }
      return _.uniq((filteredSections.value ?? []).filter(it => !it.attribute?.exampleHidden).map(s => s.path?.split('.')[0]));
    });

    const otherSection = computed(() => {
      if (!props.useNewSort) return [];
      const knownSections = _.flatten(Object.values(configSort.value) as string[][]);
      return filteredSections.value?.filter(it => !knownSections.includes(it.path!) && !it.attribute!.exampleHidden) || [];
    });

    // 所有可选 tab，包括 "其他"
    const allTabs = computed(() => {
      const tabs = bigSections.value.map(key => ({ key: key!, label: getBigSectionName(key!) }));
      if (otherSection.value.length > 0) {
        tabs.push({ key: '__other__', label: t('mod.other') });
      }
      return tabs;
    });

    // 默认选中第一个 tab
    watch(() => allTabs.value, (tabs) => {
      if (tabs.length > 0 && (!activeTab.value || !tabs.some(t => t.key === activeTab.value))) {
        activeTab.value = tabs[0].key;
      }
    }, { immediate: true });

    watch(activeTab, () => {
      scrollContainerRef.value?.scrollTo(0, 0);
    });

    // 当前要显示的 sections：搜索时显示所有匹配结果，否则只显示当前 tab
    const currentSections = computed(() => {
      if (search.value) {
        // 搜索模式：显示所有匹配的 sections（不限 tab）
        return filteredSections.value?.filter(it => !it.attribute?.exampleHidden) || [];
      }
      if (!activeTab.value) return [];
      if (activeTab.value === '__other__') return otherSection.value;
      return filteredSections.value?.filter(it => {
        if (props.useNewSort) {
          return configSort.value[activeTab.value!]?.includes(it.path!);
        }
        return it.path!.split('.')[0] === activeTab.value && !it.attribute!.exampleHidden;
      }).sort((a, b) => {
        if (!props.useNewSort) return 0;
        return configSort.value[activeTab.value!].indexOf(a.path!) - configSort.value[activeTab.value!].indexOf(b.path!);
      }) || [];
    });

    return () => <div class="grid cols-[15em_auto] rows-1 max-[900px]:cols-1 flex-1 min-h-0">
      {/* 左侧导航 */}
      <div class="flex flex-col gap-0.5 max-[900px]:hidden of-y-auto h-full">
        {allTabs.value.map(tab =>
          <div
            key={tab.key}
            class={[
              'px-3 py-1.5 rd cursor-pointer text-sm transition-colors',
              activeTab.value === tab.key && theme.value.listItemSelect, theme.value.listItemHover,
            ]}
            onClick={() => activeTab.value = tab.key}
          >
            {tab.label}
          </div>
        )}
      </div>
      <div class="flex flex-col h-full">
        <div class="min-[900px]:hidden shrink-0">
          <WhateverNaviBar items={allTabs.value.map(tab => ({
            name: tab.label,
            onClick: () => activeTab.value = tab.key,
            selected: activeTab.value === tab.key,
          }))}/>
        </div>
        <div class="flex gap-2 p-2 shrink-0">
          <TextInput v-model:value={search.value} placeholder={t('mod.searchPlaceholder')} ref={searchRef} innerClass="h-42px!" class="flex-1"/>
        </div>
        <div ref={scrollContainerRef} class="of-y-auto cst flex-1 p-2 pt-0 text-14px">
          <div class="flex flex-col gap-1">
            {currentSections.value.map((section) =>
              <ConfigSection key={section.path!} section={section}
                             entryStates={props.config.entryStates!}
                             isCommunity={communityList.value.includes(section.path!)}
                             sectionState={props.config.sectionStates![section.path!]}/>)}
          </div>
        </div>
      </div>
    </div>;
  },
});
