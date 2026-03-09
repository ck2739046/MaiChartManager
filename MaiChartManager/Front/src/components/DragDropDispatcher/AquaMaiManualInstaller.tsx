import api from '@/client/api';
import { CheckAquaMaiFileResult, PubKeyId, VerifyStatus } from '@/client/apiGen';
import { t } from '@/locales';
import { globalCapture, updateModInfo } from '@/store/refs';
import { Button, Modal, DateFormat, addToast } from '@munet/ui';
import { defineComponent, PropType, ref, computed, watch } from 'vue';
import { updateAquaMaiConfig } from '@/views/ModManager/refs';

const currentFile = ref<File>();
const checkResult = ref<CheckAquaMaiFileResult>();

export const setManualInstallAquaMai = async (file: FileSystemFileHandle) => {
  checkResult.value = undefined;
  try {
    const f = await file.getFile();
    const res = await api.CheckAquaMaiFile({ file: f });
    checkResult.value = res.data;
    if (checkResult.value?.isValid)
      currentFile.value = f;
  }
  catch (error) {
    globalCapture(error, t('mod.manualInstall.checkFailed'));
  }
}

export default defineComponent({
  // props: {
  // },
  setup(props, { emit }) {

    const installAquaMai = async () => {
      if (!currentFile.value) return;
      try {
        await api.InstallAquaMaiFile({ file: currentFile.value });
        currentFile.value = undefined;
        addToast({message: t('mod.manualInstall.installSuccess'), type: 'success'});
        await updateModInfo();
        await updateAquaMaiConfig();
      }
      catch (error) {
        globalCapture(error, t('mod.manualInstall.installFailed'));
      }
    }


    return () => <>
      <Modal
        width="min(90vw,50em)"
        title={t('mod.manualInstall.invalidAquaMaiFile')}
        show={checkResult.value?.isValid === false}
        onUpdateShow={() => checkResult.value = undefined}
      >
        {t('mod.manualInstall.invalidAquaMaiFileMessage')}
      </Modal>
      <Modal
        width="min(90vw,50em)"
        title={t('mod.manualInstall.confirmInstallTitle')}
        show={currentFile.value !== undefined}
        onUpdateShow={() => currentFile.value = undefined}
      >{{
        default: () => <div class="flex flex-col gap-2 items-center">
          <div class="flex gap-2 items-center">
            {checkResult.value?.signature?.status === VerifyStatus.Valid ?
              <div class="text-green-5 i-tabler:certificate text-2em" />
              : <div class="text-red-5 i-tabler:certificate-off text-2em" />}
            {checkResult.value?.signature?.status === VerifyStatus.Valid && checkResult.value.signature?.keyId === PubKeyId.Local &&
              <div class="text-green-6">{t('mod.signature.verifiedOfficial')}</div>}
            {checkResult.value?.signature?.status === VerifyStatus.Valid && checkResult.value.signature?.keyId === PubKeyId.CI &&
              <div class="text-green-6">{t('mod.signature.verifiedCI')}</div>}
            {checkResult.value?.signature?.status === VerifyStatus.Valid && checkResult.value.signature?.keyId === PubKeyId.None &&
              <div class="text-green-6">{t('mod.signature.verifiedOld')}</div>}
            {checkResult.value?.signature?.status === VerifyStatus.NotFound &&
              <div class="text-red-6">{t('mod.signature.notFound')}</div>}
            {checkResult.value?.signature?.status === VerifyStatus.InvalidSignature &&
              <div class="text-red-6">{t('mod.signature.invalid')}</div>}
          </div>
          <div>{t('mod.manualInstall.version')}: v{checkResult.value?.version}</div>
          <div>{t('mod.manualInstall.buildDate')}: {checkResult.value?.buildDate ? <DateFormat value={new Date(checkResult.value.buildDate)} /> : 'N/A'}</div>
        </div>,
        actions: () => <>
          <Button class="w-0 grow" onClick={() => currentFile.value = undefined}>{t('common.cancel')}</Button>
          <Button class="w-0 grow" onClick={installAquaMai} variant={checkResult.value?.signature?.status === VerifyStatus.Valid ? "primary" : "secondary"}>{t('common.confirm')}</Button>
        </>
      }}</Modal>
    </>;
  },
});
