import { defineComponent, PropType } from 'vue';
import { IEntryState, ISectionState, Section } from "@/client/apiGen";
import { CheckBox } from '@munet/ui';
import { getNameForPath } from '../../utils';
import ConfigEntry from '../../ConfigEntry';

export default defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props) {
    const PREFIX = 'GameSystem.Unlock.';
    const booleanKeys = ['Maps', 'Songs', 'Tickets', 'Courses', 'Utage', 'Titles', 'Icons', 'Plates', 'Frames', 'Partners', 'Events', 'Characters'];
    const booleanPaths = booleanKeys.map(it => PREFIX + it);

    const findEntry = (key: string) => props.section.entries?.find(it => it.path === PREFIX + key);

    return () => <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-x-4 gap-y-1 p-l-47">
        {booleanKeys.map(key => {
          const entry = findEntry(key);
          if (!entry) return null;
          return <CheckBox v-model:value={props.entryStates[PREFIX + key].value}>
            {getNameForPath(entry.path!, entry.name!, entry.attribute?.comment?.nameZh)}
          </CheckBox>;
        })}
      </div>
      {props.section.entries?.filter(it => !booleanPaths.includes(it.path!))
        .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
    </div>;
  },
});
