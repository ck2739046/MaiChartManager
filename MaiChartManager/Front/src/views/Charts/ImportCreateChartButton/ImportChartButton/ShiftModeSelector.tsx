import { computed, defineComponent, PropType } from "vue";
import { Popover, Radio } from "@munet/ui";
import { ShiftMethod } from "@/client/apiGen";
import { TempOptions } from "./types";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    tempOptions: {type: Object as PropType<TempOptions>, required: true},
  },
  setup(props) {
    const {t} = useI18n();

    const value = computed({
      get: () => props.tempOptions.shift,
      set: (v: ShiftMethod) => { if (!props.tempOptions.shiftLocked) props.tempOptions.shift = v }
    })

    return () => <div>
      <div class="text-sm">{t('chart.import.option.shiftMode')}</div>
      <div class="flex flex-col gap-2 w-full">
        <div class="flex gap-2 h-34px items-center">
          <Popover trigger="hover">
            {{
              trigger: () => <Radio k={ShiftMethod.Bar} v-model:value={value.value}>{t('chart.import.option.shiftByBar')}</Radio>,
              default: () => <div>
                {props.tempOptions.shiftLocked ? t('chart.import.option.shiftModeLocked') : t('chart.import.option.shiftByBarDesc')}
              </div>
            }}
          </Popover>
          <Popover trigger="hover">
            {{
              trigger: () => <Radio k={ShiftMethod.Legacy} v-model:value={value.value}>{t('chart.import.option.shiftLegacy')}</Radio>,
              default: () => <div>
                {props.tempOptions.shiftLocked ? t('chart.import.option.shiftModeLocked') : t('chart.import.option.shiftLegacyDesc')}
              </div>
            }}
          </Popover>
          <Popover trigger="hover">
            {{
              trigger: () => <Radio k={ShiftMethod.NoShift} v-model:value={value.value}>{t('chart.import.option.shiftNoMove')}</Radio>,
              default: () => <div>
                {props.tempOptions.shiftLocked ? t('chart.import.option.shiftModeLocked') : t('chart.import.option.shiftNoMoveDesc')}
              </div>
            }}
          </Popover>
        </div>
      </div>
    </div>
  }
})
