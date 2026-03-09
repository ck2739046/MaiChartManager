import { defineComponent, ref, computed, Transition, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/client/api';
import WelcomePage from './WelcomePage';
import GameDirPage from './GameDirPage';
import ModeSelectPage from './ModeSelectPage';
import ServerRunningPage from './ServerRunningPage';
import './transitions.css';
import { ensureBackendUrl } from '@/utils/ensureBackendUrl';

enum Step {
  Welcome,
  GameDir,
  ModeSelect,
  ServerRunning,
}

export default defineComponent({
  setup() {
    const route = useRoute();
    let initStep = Step.Welcome;
    if (route.name === 'server') {
      initStep = Step.ServerRunning;
    } else if (route.name === 'set-mode') {
      initStep = Step.ModeSelect;
    }
    const step = ref<Step>(initStep);
    const direction = ref<'forward' | 'backward'>('forward');

    // Step 1 state
    const gamePath = ref('');
    const pathValid = ref(false);
    const initializing = ref(false);

    // Step 2 state
    const completing = ref(false);
    const lanAddresses = ref<string[]>([]);

    const canGoNext = computed(() => {
      if (step.value === 0) return true;
      if (step.value === 1) return pathValid.value && !initializing.value;
      return false;
    });

    onMounted(async () => {
      if (route.name === 'server') {
        await ensureBackendUrl();
        const res = await api.GetLanAddresses();
        lanAddresses.value = res.data || [];
      }
    })

    const goNext = async () => {
      if (step.value === 0) {
        direction.value = 'forward';
        step.value = 1;
      } else if (step.value === 1) {
        initializing.value = true;
        try {
          await api.InitializeGameData();
          initializing.value = false;
          direction.value = 'forward';
          step.value = 2;
        } catch (e) {
          initializing.value = false;
        }
      }
    };

    const goPrev = () => {
      if (step.value > 0) {
        direction.value = 'backward';
        if (step.value === Step.ServerRunning) {
          step.value = Step.ModeSelect;
        } else {
          step.value--;
        }
        // 启动完之后退回的情况，应该等动画完再改
        // 就是要让它回到请选择模式（x
        // 或者说其实不应该这么做，服务器运行中那一页应该算是第四页吧
        setTimeout(() => {
          lanAddresses.value = [];
        }, 500);
      }
    };

    const handleComplete = async (opts: { isRemote: boolean; useAuth: boolean; authUsername: string; authPassword: string; startupEnabled: boolean }) => {
      completing.value = true;
      try {
        await api.CompleteSetup({
          export: opts.isRemote,
          useAuth: opts.useAuth,
          authUsername: opts.authUsername || null,
          authPassword: opts.authPassword || null,
          startupEnabled: opts.startupEnabled,
        });
        if (opts.isRemote) {
          // Server restarts when export mode changes, need to wait for it to be ready
          let retries = 0;
          const maxRetries = 30;
          while (retries < maxRetries) {
            try {
              const res = await api.GetLanAddresses();
              lanAddresses.value = res.data || [];
              direction.value = 'forward';
              step.value = Step.ServerRunning;
              completing.value = false;
              break;
            } catch {
              retries++;
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          if (retries >= maxRetries) {
            completing.value = false;
          }
        }
      } catch (e) {
        completing.value = false;
      }
    };

    const transitionName = computed(() =>
      direction.value === 'forward' ? 'oobe-slide-forward' : 'oobe-slide-backward'
    );

    return () => (
      <div class="fixed inset-0 bg-[oklch(0.97_0.01_var(--hue))] flex flex-col">
        <div class="flex-1 overflow-hidden relative">
          <Transition name={transitionName.value}>
            {step.value === 0 && <WelcomePage key="welcome" />}
            {step.value === 1 &&
              <GameDirPage
                key="gamedir"
                gamePath={gamePath.value}
                onUpdate:gamePath={(v: string) => gamePath.value = v}
                pathValid={pathValid.value}
                onUpdate:pathValid={(v: boolean) => pathValid.value = v}
                initializing={initializing.value}
                onUpdate:initializing={(v: boolean) => initializing.value = v}
              />
            }
            {step.value === Step.ModeSelect &&
              <ModeSelectPage
                key="modeselect"
                completing={completing.value}
                onComplete={handleComplete}
              />
            }
            {step.value === Step.ServerRunning &&
              <ServerRunningPage
                key="serverrunning"
                lanAddresses={lanAddresses.value}
              />
            }
          </Transition>
        </div>
        <div class="relative h-16 shrink-0">
          {step.value > 0 && (
            <button
              class="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-[oklch(0.6_0.15_var(--hue))]! hover:bg-[oklch(0.6_0.15_var(--hue)/0.8)]! text-white cursor-pointer border-none flex items-center justify-center"
              onClick={goPrev}
              disabled={completing.value}
            >
              <div class="i-mdi-arrow-left text-xl" />
            </button>
          )}
          {step.value < 2 && (
            <button
              class={['fixed bottom-6 right-6 w-14 h-14 rounded-full border-none flex items-center justify-center',
                canGoNext.value ? 'bg-[oklch(0.6_0.15_var(--hue))]! hover:bg-[oklch(0.6_0.15_var(--hue)/0.8)]! cursor-pointer text-white' : 'bg-gray-200! cursor-not-allowed text-gray-400']}
              onClick={() => canGoNext.value && goNext()}
              disabled={!canGoNext.value}
            >
              <div class="i-mdi-arrow-right text-6" />
            </button>
          )}
        </div>
      </div>
    );
  },
});
