import { defineComponent } from "vue";
import { selectMusicId } from "@/store/refs";
import DeleteMusicButton from "./DeleteMusicButton";
import SaveButton from "./SaveButton";

export default defineComponent({
  setup() {
    return () => !!selectMusicId.value && <>
      <DeleteMusicButton/>
      <SaveButton/>
    </>;
  }
})
