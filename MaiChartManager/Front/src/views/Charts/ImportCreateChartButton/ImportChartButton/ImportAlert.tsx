import { defineComponent, PropType } from "vue";
import { MessageLevel, ShiftMethod } from "@/client/apiGen";
import { ImportChartMessageEx, TempOptions } from "./types";
import { showNeedPurchaseDialog } from "@/store/refs";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    tempOptions: {type: Object as PropType<TempOptions>, required: true},
    errors: {type: Array as PropType<ImportChartMessageEx[]>, required: true}
  },
  setup(props, {emit}) {
    const {t} = useI18n();

    return () => <div class="of-y-auto cst max-h-24vh">
      <div class="flex flex-col gap-2">
        {
          props.errors.map((error, i) => {
            if ('first' in error) {
              if (error.padding > 0 && props.tempOptions.shift === ShiftMethod.Legacy) {
                return <div key={i} class="p-3 rounded border border-blue/30 bg-blue/10">
                  <div class="font-bold mb-1">{error.name}</div>
                  {t('chart.import.addPadding', {padding: error.padding.toFixed(3)})}
                </div>
              }
              if (error.padding < 0 && props.tempOptions.shift === ShiftMethod.Legacy) {
                return <div key={i} class="p-3 rounded border border-blue/30 bg-blue/10">
                  <div class="font-bold mb-1">{error.name}</div>
                  {t('chart.import.trimPadding', {padding: (-error.padding).toFixed(3)})}
                </div>
              }
              if (error.first > 0 && props.tempOptions.shift === ShiftMethod.NoShift) {
                return <div key={i} class="p-3 rounded border border-blue/30 bg-blue/10">
                  <div class="font-bold mb-1">{error.name}</div>
                  {t('chart.import.trimFirst', {first: error.first.toFixed(3)})}
                </div>
              }
              if (error.first < 0 && props.tempOptions.shift === ShiftMethod.NoShift) {
                return <div key={i} class="p-3 rounded border border-blue/30 bg-blue/10">
                  <div class="font-bold mb-1">{error.name}</div>
                  {t('chart.import.addFirst', {first: (-error.first).toFixed(3)})}
                </div>
              }
              return <></>
            }
            let borderColor = 'border-gray/30';
            let bgColor = 'bg-gray/10';
            switch (error.level) {
              case MessageLevel.Info:
                borderColor = 'border-blue/30';
                bgColor = 'bg-blue/10';
                break;
              case MessageLevel.Warning:
                borderColor = 'border-yellow/30';
                bgColor = 'bg-yellow/10';
                break;
              case MessageLevel.Fatal:
                borderColor = 'border-red/30';
                bgColor = 'bg-red/10';
                break;
            }
            return <div key={i} class={`p-3 rounded border ${borderColor} ${bgColor} ${error.isPaid && 'cursor-pointer'}`}
              // @ts-ignore
                         onClick={() => error.isPaid && (showNeedPurchaseDialog.value = true)}
            >
              <div class="font-bold mb-1">{error.name}</div>
              <div class="whitespace-pre-wrap">
                {error.message}
              </div>
            </div>
          })
        }
      </div>
    </div>
  }
})
