import { computed, defineComponent, PropType, ref } from "vue";
import { DropMenu, NumberInput } from "@munet/ui";
import { b15ver, gameVersion, selectedADir, version } from "@/store/refs";
import { useI18n } from 'vue-i18n';

// 这是 version 不是 addVersion，是大家都喜欢写 22001 的那个 version
export default defineComponent({
  props: {
    value: Number
  },
  setup(props, {emit}) {
    const { t } = useI18n();
    const value = computed({
      get: () => props.value || 0,
      set: (v) => emit('update:value', v)
    })

    const showMenu = computed(() => !!version.value?.gameVersion && selectedADir.value !== 'A000');

    const options = computed(() => [
      { label: t('music.edit.includeB35'), action: () => { value.value = 20000; } },
      { label: t('music.edit.includeB15'), action: () => { value.value = 20000 + version.value!.gameVersion! * 100; } },
    ]);

    return () => <DropMenu options={options.value}>
      {{
        trigger: (toggle: (val?: boolean) => void) =>
          <NumberInput
            class="w-full"
            v-model:value={value.value}
            min={0}
            onFocus={() => showMenu.value && toggle(true)}
          />,
      }}
    </DropMenu>;
  }
})
