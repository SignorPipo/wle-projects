/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 *     - `wle:auto-constants:start` and `wle:auto-constants:end`: The project's constants,
 *        such as the project's name, whether it should use the physx runtime, etc...
 *     - `wle:auto-benchmark:start` and `wle:auto-benchmark:end`: Append the benchmarking code
 */

const waitWindowLoad: Promise<void> = new Promise((resolve: () => void) => {
    if (document.readyState == "complete") {
        resolve();
    } else {
        window.addEventListener("load", resolve, { once: true });
    }
});

await waitWindowLoad;

/* wle:auto-imports:start */
import {Cursor} from '@wonderlandengine/components';
import {CursorTarget} from '@wonderlandengine/components';
import {MouseLookComponent} from '@wonderlandengine/components';
import {AdjustHierarchyPhysXScaleComponent} from 'wle-pp';
import {ConsoleVRToolComponent} from 'wle-pp';
import {CursorButtonComponent} from 'wle-pp';
import {EasyTuneToolComponent} from 'wle-pp';
import {FingerCursorComponent} from 'wle-pp';
import {GamepadMeshAnimatorComponent} from 'wle-pp';
import {GrabbableComponent} from 'wle-pp';
import {GrabberHandComponent} from 'wle-pp';
import {MuteEverythingComponent} from 'wle-pp';
import {PPGatewayComponent} from 'wle-pp';
import {PlayerLocomotionComponent} from 'wle-pp';
import {ResetLocalTransformComponent} from 'wle-pp';
import {ScaleOnSpawnComponent} from 'wle-pp';
import {SetActiveComponent} from 'wle-pp';
import {SetHandLocalTransformComponent} from 'wle-pp';
import {SetHeadLocalTransformComponent} from 'wle-pp';
import {SpatialAudioListenerComponent} from 'wle-pp';
import {SwitchHandObjectComponent} from 'wle-pp';
import {ToolCursorComponent} from 'wle-pp';
import {TrackedHandDrawAllJointsComponent} from 'wle-pp';
import {VirtualGamepadComponent} from 'wle-pp';
import {FadeViewComponent} from './playground/components/fade_view_component.js';
import {FunComponent} from './playground/components/fun_component.js';
import {GrabbableSpawnerComponent} from './playground/components/grabbable_spawner_component.js';
import {LoadAudioComponent} from './playground/components/load_audio_component.js';
import {ParticlesSpawnerComponent} from './playground/components/particles_spawner_component.js';
import {PlayMusicComponent} from './playground/components/play_music_component.js';
import {PlaygroundGatewayComponent} from './playground/components/playground_gateway_component.js';
import {SetActiveOnMobileComponent} from './playground/components/set_active_on_mobile_component.js';
import {SetActiveOnMobileComponent as SetActiveOnMobileComponent1} from './playground/components/set_active_on_tracked_hands_component.js';
import {SFXOnCollisionComponent} from './playground/components/sfx_on_collision_component.js';
import {SFXOnGrabThrowComponent} from './playground/components/sfx_on_grab_throw_component.js';
import {TargetHitCheckComponent} from './playground/components/target_hit_check_component.js';
import {TeleportOnTrackedHandsComponent} from './playground/components/teleport_on_tracked_hands_component.js';
import {ToggleHowToTextComponent} from './playground/components/toggle_how_to_text_component.js';
import {WaveMovementComponent} from './playground/components/wave_movement_component.js';
/* wle:auto-imports:end */

import { loadRuntime, LoadRuntimeOptions, LogLevel } from '@wonderlandengine/api';
import 'wle-pp/add_type_extensions_to_typescript.js';

/* wle:auto-constants:start */
const Constants = {
    ProjectName: 'native-pwa',
    RuntimeBaseName: 'WonderlandRuntime',
    WebXRRequiredFeatures: ['local',],
    WebXROptionalFeatures: ['local','local-floor','hand-tracking','hit-test',],
};
const RuntimeOptions = {
    physx: true,
    loader: false,
    xrFramebufferScaleFactor: 1,
    xrOfferSession: {
        mode: 'auto',
        features: Constants.WebXRRequiredFeatures,
        optionalFeatures: Constants.WebXROptionalFeatures,
    },
    canvas: 'canvas',
} as const;
/* wle:auto-constants:end */

const disableEngineLogs = false;
if (disableEngineLogs) {
    (RuntimeOptions as LoadRuntimeOptions).logs = [LogLevel.Error];
}

const engine = await loadRuntime(Constants.RuntimeBaseName, RuntimeOptions);
engine.onLoadingScreenEnd.once(() => {
    const el = document.getElementById('version');
    if (el) setTimeout(() => el.remove(), 2000);
});

// PWA instantly requests session
engine
    .requestXRSession('immersive-vr', Constants.WebXRRequiredFeatures, Constants.WebXROptionalFeatures)
    .catch((e) => console.error(e));

/* WebXR setup. */

function requestSession(mode: XRSessionMode): void {
    engine
        .requestXRSession(mode, Constants.WebXRRequiredFeatures, Constants.WebXROptionalFeatures)
        .catch((e) => console.error(e));
}

function setupButtonsXR(): void {
    /* Setup AR / VR buttons */
    const arButton = document.getElementById('ar-button');
    if (arButton) {
        arButton.dataset.supported = engine.arSupported as unknown as string;
        arButton.addEventListener('click', () => requestSession('immersive-ar'));
    }
    const vrButton = document.getElementById('vr-button');
    if (vrButton) {
        vrButton.dataset.supported = engine.vrSupported as unknown as string;
        vrButton.addEventListener('click', () => requestSession('immersive-vr'));
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('load', setupButtonsXR);
} else {
    setupButtonsXR();
}

/* wle:auto-register:start */
engine.registerComponent(Cursor);
engine.registerComponent(CursorTarget);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(AdjustHierarchyPhysXScaleComponent);
engine.registerComponent(ConsoleVRToolComponent);
engine.registerComponent(CursorButtonComponent);
engine.registerComponent(EasyTuneToolComponent);
engine.registerComponent(FingerCursorComponent);
engine.registerComponent(GamepadMeshAnimatorComponent);
engine.registerComponent(GrabbableComponent);
engine.registerComponent(GrabberHandComponent);
engine.registerComponent(MuteEverythingComponent);
engine.registerComponent(PPGatewayComponent);
engine.registerComponent(PlayerLocomotionComponent);
engine.registerComponent(ResetLocalTransformComponent);
engine.registerComponent(ScaleOnSpawnComponent);
engine.registerComponent(SetActiveComponent);
engine.registerComponent(SetHandLocalTransformComponent);
engine.registerComponent(SetHeadLocalTransformComponent);
engine.registerComponent(SpatialAudioListenerComponent);
engine.registerComponent(SwitchHandObjectComponent);
engine.registerComponent(ToolCursorComponent);
engine.registerComponent(TrackedHandDrawAllJointsComponent);
engine.registerComponent(VirtualGamepadComponent);
engine.registerComponent(FadeViewComponent);
engine.registerComponent(FunComponent);
engine.registerComponent(GrabbableSpawnerComponent);
engine.registerComponent(LoadAudioComponent);
engine.registerComponent(ParticlesSpawnerComponent);
engine.registerComponent(PlayMusicComponent);
engine.registerComponent(PlaygroundGatewayComponent);
engine.registerComponent(SetActiveOnMobileComponent);
engine.registerComponent(SetActiveOnMobileComponent1);
engine.registerComponent(SFXOnCollisionComponent);
engine.registerComponent(SFXOnGrabThrowComponent);
engine.registerComponent(TargetHitCheckComponent);
engine.registerComponent(TeleportOnTrackedHandsComponent);
engine.registerComponent(ToggleHowToTextComponent);
engine.registerComponent(WaveMovementComponent);
/* wle:auto-register:end */

const sceneLoadDelaySeconds = 0;
if (sceneLoadDelaySeconds > 0) {
    await new Promise((resolve) => setTimeout(resolve, sceneLoadDelaySeconds * 1000));
}

try {
    await engine.loadMainScene(`${Constants.ProjectName}.bin`);
} catch (error) {
    console.error(error);
    window.alert(`Failed to load ${Constants.ProjectName}.bin: ` + error);
}

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */