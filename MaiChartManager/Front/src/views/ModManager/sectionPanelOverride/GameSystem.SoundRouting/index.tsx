import { defineComponent, PropType } from 'vue';
import { IEntryState, ISectionState, Section } from "@/client/apiGen";
import { Select, NumberInput } from '@munet/ui';
import { useI18n } from 'vue-i18n';
import { getNameForPath } from '../../utils';
import ConfigEntry from '../../ConfigEntry';
import { ENTRY_GROUP_PADDING, ENTRY_LABEL_CLASS } from '../../constants';

export default defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props) {
    const { t } = useI18n();
    const PREFIX = 'GameSystem.SoundRouting.';

    const soundChannelOptions = ['None', 'P1SpeakerLeft', 'P1SpeakerRight', 'P1HeadphoneLeft', 'P1HeadphoneRight', 'P2SpeakerLeft', 'P2SpeakerRight', 'P2HeadphoneLeft', 'P2HeadphoneRight']
      .map(channel => ({ label: t('mod.soundChannel.' + channel), value: channel }));

    const p1Routes = ['RouteP1SpeakerLeftTo', 'RouteP1SpeakerRightTo', 'RouteP1HeadphoneLeftTo', 'RouteP1HeadphoneRightTo'];
    const p2Routes = ['RouteP2SpeakerLeftTo', 'RouteP2SpeakerRightTo', 'RouteP2HeadphoneLeftTo', 'RouteP2HeadphoneRightTo'];
    const p1Volumes = ['VolumeP1Speaker', 'VolumeP1Headphone'];
    const p2Volumes = ['VolumeP2Speaker', 'VolumeP2Headphone'];
    const knownPaths = [...p1Routes, ...p2Routes, ...p1Volumes, ...p2Volumes].map(it => PREFIX + it);

    const findEntry = (key: string) => props.section.entries?.find(it => it.path === PREFIX + key);

    const renderSelect = (key: string) => {
      const entry = findEntry(key);
      if (!entry) return null;
      return <div class="flex gap-2 items-start">
        <div class={ENTRY_LABEL_CLASS}>{getNameForPath(entry.path!, entry.name!, entry.attribute?.comment?.nameZh)}</div>
        <Select class="w-full" v-model:value={props.entryStates[PREFIX + key].value} options={soundChannelOptions}/>
      </div>;
    };

    const renderVolume = (key: string) => {
      const entry = findEntry(key);
      if (!entry) return null;
      return <div class="flex gap-2 items-start">
        <div class={ENTRY_LABEL_CLASS}>{getNameForPath(entry.path!, entry.name!, entry.attribute?.comment?.nameZh)}</div>
        <NumberInput innerClass="h-42px!" v-model:value={props.entryStates[PREFIX + key].value} step={0.1}/>
      </div>;
    };

    return () => <div class="flex flex-col gap-2">
      <div class={["grid grid-cols-1 min-[500px]:grid-cols-2 gap-y-12px gap-x-16px", ENTRY_GROUP_PADDING]}>
        <div class="flex flex-col gap-2">
          {p1Routes.map(renderSelect)}
          {p1Volumes.map(renderVolume)}
        </div>
        <div class="flex flex-col gap-2">
          {p2Routes.map(renderSelect)}
          {p2Volumes.map(renderVolume)}
        </div>
      </div>
      {props.section.entries?.filter(it => !knownPaths.includes(it.path!))
        .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
    </div>;
  },
});
