import { ref } from "vue";
import { SettingsDto } from "@/client/apiGen";
import api from "@/client/api";

export const appSettings = ref<SettingsDto>({});

export const updateSettings = async () => {
  appSettings.value = (await api.GetSettings()).data;
};

export const saveSettings = async () => {
  await api.SetSettings(appSettings.value);
};
