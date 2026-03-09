import { ref } from "vue";
import { GetAssetsDirsResult } from "@/client/apiGen";

export type LeftPanel = 'musicList' | 'assetDirs';
export type RightPanel = 'musicEdit' | 'memoEdit';

export const leftPanel = ref<LeftPanel>('musicList');
export const rightPanel = ref<RightPanel>('musicEdit');

// memo editing state
export const editingMemoDir = ref<GetAssetsDirsResult>();
export const editingMemoName = ref('');
