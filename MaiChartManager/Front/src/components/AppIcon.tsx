import { defineComponent } from "vue";
import '@fontsource/nerko-one'

export default defineComponent({
  setup(_, { attrs }) {
    return () => <div class="flex flex-col items-center font-['Nerko_One'] text-20cqw text-stroke-2 lh-[0.8]" {...attrs}>
      <div class="flex gap-2">
        <div class="c-#c3c4f8 text-stroke-#8791e2">
          Mai
        </div>
        <div class="c-#f7abca text-stroke-#d079b2">
          Chart
        </div>
      </div>
      <div class="c-#fef19d text-stroke-#e3c86a">
        Manager
      </div>
    </div>
  }
})
