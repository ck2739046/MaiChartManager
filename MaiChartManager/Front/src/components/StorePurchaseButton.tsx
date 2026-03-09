import { defineComponent } from "vue";
import { Button, showTransactionalDialog } from "@munet/ui";
import api, { isWebView } from "@/client/api";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const { t } = useI18n();

    const onClick = async () => {
      if (!isWebView) {
        const confirmed = await showTransactionalDialog(
          t('message.notice'),
          t('purchase.needServerSide'),
          [{ text: t('purchase.continue'), action: true }, { text: t('common.cancel'), action: false }]
        );
        if (confirmed) {
          api.RequestPurchase()
        }
      } else {
        api.RequestPurchase()
      }
    }

    return () => <Button variant="secondary" onClick={onClick}>
      <span class="i-fluent-store-microsoft-16-filled text-lg mr-2"/>
      Microsoft Store
    </Button>;
  }
})
