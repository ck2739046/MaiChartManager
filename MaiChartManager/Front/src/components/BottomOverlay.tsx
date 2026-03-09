import { defineComponent, Teleport, Transition } from 'vue';

export default defineComponent({
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => (
      <Teleport to="body">
        <Transition
          duration={300}
          enterActiveClass="transition-opacity transition-300 transition-ease"
          leaveActiveClass="transition-opacity transition-300 transition-ease"
          enterFromClass="op-0!"
          leaveToClass="op-0!"
        >
          {props.show && (
            <div class="fixed inset-0 z-40 bg-foregroundTask backdrop-blur-lg flex flex-col justify-end items-start">
              <div class="w-full max-w-200 p-6 pb-10 flex flex-col gap-3 items-start">
                {props.title && <div class="text-lg op-80">{props.title}</div>}
                {slots.default?.()}
              </div>
            </div>
          )}
        </Transition>
      </Teleport>
    );
  },
})
