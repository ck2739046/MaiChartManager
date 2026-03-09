import { defineComponent, PropType } from "vue";
import { Popover } from "@munet/ui";

export default defineComponent({
  props: {
    problems: { type: Array as PropType<string[]>, required: true },
  },
  setup(props) {
    return () => !!props.problems?.length && <Popover trigger="hover">
      {{
        // 它又不居中
        trigger: () => <div class="text-#f0a020 i-material-symbols-warning-outline-rounded text-2em translate-y-.3"/>,
        default: () => <div class="flex flex-col gap-2">
          {props.problems!.map((p, index) => <div key={index}>{p}</div>)}
        </div>
      }}
    </Popover>;
  }
})
