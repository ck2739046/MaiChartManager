import { getUrl } from '@/client/api';
import { Modal, Progress, addToast } from '@munet/ui';
import { defineComponent, ref } from 'vue';
import { LicenseStatus } from '@/client/apiGen';
import { globalCapture, showNeedPurchaseDialog, version } from '@/store/refs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useI18n } from 'vue-i18n';

enum STEP {
  None,
  Progress,
}

export default defineComponent({
  setup(props, { expose }) {
    const step = ref(STEP.None);
    const progress = ref(0);
    const { t } = useI18n();

    const handleVideoConvert = async () => {
      step.value = STEP.Progress;
      progress.value = 0;

      const controller = new AbortController();

      try {
        await new Promise<void>((resolve, reject) => {
          fetchEventSource(getUrl('VideoConvertToolApi'), {
            signal: controller.signal,
            method: 'POST',
            onerror(e) {
              reject(e);
              controller.abort();
              throw new Error("disable retry onerror");
            },
            onclose() {
              reject(new Error("EventSource Close"));
              controller.abort();
              throw new Error("disable retry onclose");
            },
            openWhenHidden: true,
            onmessage: (e) => {
              switch (e.event) {
                case 'Progress':
                  progress.value = parseInt(e.data);
                  break;
                case 'Success':
                  console.log("success", e.data);
                  controller.abort();
                  addToast({message: t('tools.convertSuccess'), type: 'success'});
                  resolve();
                  break;
                case 'Error':
                  controller.abort();
                  reject(new Error(e.data));
                  break;
              }
            }
          });
        });
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        console.log(e);
        if (e.message === t('error.file.notSelected')) return;
        globalCapture(e, t('tools.videoConvertError'));
      } finally {
        step.value = STEP.None;
      }
    };

    const trigger = () => {
      if (version.value?.license !== LicenseStatus.Active) {
        showNeedPurchaseDialog.value = true;
        return;
      }
      handleVideoConvert();
    };

    expose({
      trigger,
    });

    return () => <>
      <Modal
        width="min(40vw,40em)"
        title={t('tools.converting')}
        show={step.value === STEP.Progress}
        esc={false}
      >
        <Progress
          percentage={progress.value}
          status="success"
          showIndicator
        >
          {progress.value === 100 ? t('tools.videoOptions.processing') : `${progress.value}%`}
        </Progress>
      </Modal>
    </>;
  },
});
