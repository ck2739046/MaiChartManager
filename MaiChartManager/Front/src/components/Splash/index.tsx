import { defineComponent, computed, ref, Transition, onMounted } from 'vue';
import rei from './mcm.png'

export default defineComponent({
  props: {
    show: { type: Boolean, required: true },
  },
  setup(props) {
    const hardShow = ref(true);
    setTimeout(() => hardShow.value = false, 100);
    const show = computed(() => hardShow.value || props.show);
    const fontLoaded = ref(false);
    onMounted(() => {
      document.fonts.ready.then(() => fontLoaded.value = true);
    });

    return () => <Transition
      duration={{ enter: 0, leave: 500 }}
      leaveActiveClass="transition-opacity duration-500 transition-ease-in-out"
      leaveFromClass="opacity-100"
      leaveToClass="opacity-0"
    >
      {show.value && <div class="fixed inset-0 bg-[oklch(0.95_0.01_var(--hue))] flex flex-col items-center justify-center gap-14 z-40">
        <img src={rei} alt="Rei" class="h-65" />
        <div class="op-90">Loading Data...</div>
      </div>}
    </Transition>;
  },
});
