import { Popover } from '@munet/ui';
import { defineComponent, PropType, ref, computed, watch } from 'vue';

export default defineComponent({
  // props: {
  // },
  setup(props, { emit }) {

    return () => <Popover trigger="hover">
    {{
      trigger: () => <div class="text-#5b79c4 i-mdi:arrow-left-right-bold text-2em" />,
      default: () => "LongMusic"
    }}
  </Popover>;
  },
});
