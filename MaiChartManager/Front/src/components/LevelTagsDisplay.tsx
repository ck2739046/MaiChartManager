import { defineComponent, PropType } from "vue";
import { Chart } from "@/client/apiGen";
import { LEVEL_COLOR, LEVELS } from "@/consts";

export default defineComponent({
  props: {
    charts: {type: Array as PropType<(Chart | undefined)[]>, required: true},
    showLevelDecimal: {type: Boolean, default: false} // 如果为true，显示的是定数12.8，否则是12+。
  },
  setup(props) {
    return () => <div class="flex gap-1 pt-1 text-sm">
      {
        (props.charts || []).map((chart, index) =>
          chart && chart.enable && <div key={index} class="c-white rounded-full px-2" style={{ backgroundColor: LEVEL_COLOR[index!] }}>
            {props.showLevelDecimal ? chart.level + "." + chart.levelDecimal : LEVELS[chart.levelId!]}
        </div>)
      }
    </div>
  }
})
