import { computed, defineComponent, PropType } from "vue";
import { GetAssetsDirsResult } from "@/client/apiGen";
import { DropMenu, Button } from '@munet/ui';
import { useI18n } from 'vue-i18n';
import { rightPanel, editingMemoDir, editingMemoName } from "@/views/Charts/refs";

export default defineComponent({
  props: {
    dir: {type: Object as PropType<GetAssetsDirsResult>, required: true}
  },
  setup(props) {
    const { t } = useI18n();
    const memos = computed(() => props.dir.subFiles!.filter(f => f.toLowerCase().endsWith('.txt')));

    const onSelect = (key: string) => {
      editingMemoDir.value = props.dir;
      editingMemoName.value = key;
      rightPanel.value = 'memoEdit';
    };

    const options = computed(() => [
      ...memos.value.map(it => ({
        label: it,
        action: () => onSelect(it),
      })),
      {
        label: t('common.create'),
        icon: 'i-mdi-plus',
        action: () => onSelect('add'),
      },
    ]);

    return () => (
      <DropMenu options={options.value} buttonText="">
        {{
          trigger: (toggle: (val?: boolean) => void) => (
            <Button variant="secondary" onClick={() => toggle()}>
              <div class="flex items-center gap-1">
                <span class="i-material-symbols-edit-note text-lg translate-y-.3" />
                {memos.value.length || ''}
              </div>
            </Button>
          ),
        }}
      </DropMenu>
    );
  }
})