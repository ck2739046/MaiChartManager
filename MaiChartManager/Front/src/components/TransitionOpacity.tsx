import { defineComponent, PropType, ref, computed, Transition } from 'vue';

export default defineComponent({
  props: {
    mode: { type: String as PropType<'out-in' | 'in-out' | 'default'>, default: 'default' },
  },
  setup(props, { emit, slots }) {

    return () => <Transition
      duration={300}
      mode={props.mode}
      enterActiveClass="transition-opacity transition-300 transition-ease"
      leaveActiveClass="transition-opacity transition-300 transition-ease"
      enterFromClass="op-0!"
      leaveToClass="op-0!"
    >
      {slots.default?.()}
    </Transition>;
  },
});
