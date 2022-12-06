PP.MouseButtonID = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
};

PP.Mouse = class Mouse {
    constructor() {
        // #TODO refactor Mouse/Keyboard/Gamepad and create a sort of parent ButtonHandler that have the base ButtonInfo and all of them inherit

        this._myButtonInfos = new Map();
        for (let key in PP.MouseButtonID) {
            this._myButtonInfos.set(PP.MouseButtonID[key],
                { myIsPressed: false, myIsPressStart: false, myIsPressStartToProcess: false, myIsPressEnd: false, myIsPressEndToProcess: false, });
        }

        this._myPreventContextMenuCallback = this._preventContextMenu.bind(this);
        this._myPreventMiddleButtonScrollCallback = this._preventMiddleButtonScroll.bind(this);

        this._myInternalMousePosition = PP.vec2_create();
        this._myScreenSize = PP.vec2_create();
        this._updateScreenSize();

        this._myResetMovingDelay = 0.15;
        this._myResetMovingTimer = new PP.Timer(this._myResetMovingDelay, false);
        this._myIsMoving = false;

        this._myIsInsideView = true;
        this._myIsValid = false;

        this._myContextMenuActive = true;
        this._myMiddleButtonScrollActive = true;

        // Support Variables
        this._myProjectionMatrixInverse = PP.mat4_create();
        this._myRotationQuat = PP.quat_create();
        this._myOriginWorld = PP.vec3_create();
        this._myDirectionWorld = PP.vec3_create();
    }

    start() {
        this._myOnMouseMoveCallback = this._onMouseMove.bind(this);
        document.body.addEventListener("mousemove", this._myOnMouseMoveCallback);
        this._myOnMouseDownCallback = this._onMouseDown.bind(this);
        document.body.addEventListener("mousedown", this._myOnMouseDownCallback);
        this._myOnMouseUpCallback = this._onMouseUp.bind(this);
        document.body.addEventListener("mouseup", this._myOnMouseUpCallback);
        this._myOnMouseLeaveCallback = this._onMouseLeave.bind(this);
        document.body.addEventListener("mouseleave", this._myOnMouseLeaveCallback);
        this._myOnMouseEnterCallback = this._onMouseEnter.bind(this);
        document.body.addEventListener("mouseenter", this._myOnMouseEnterCallback);
    }

    update(dt) {
        if (this._myResetMovingTimer.isRunning()) {
            this._myResetMovingTimer.update(dt);
            if (this._myResetMovingTimer.isDone()) {
                this._myResetMovingTimer.reset();
                this._myIsMoving = false;
            }
        }

        for (let buttonInfo of this._myButtonInfos.values()) {
            buttonInfo.myIsPressStart = buttonInfo.myIsPressStartToProcess;
            buttonInfo.myIsPressEnd = buttonInfo.myIsPressEndToProcess;
            buttonInfo.myIsPressStartToProcess = false;
            buttonInfo.myIsPressEndToProcess = false;
        }

        this._updateScreenSize();
    }

    destroy() {
        document.body.removeEventListener("mousemove", this._myOnMouseMoveCallback);
        document.body.removeEventListener("mousedown", this._myOnMouseDownCallback);
        document.body.removeEventListener("mouseup", this._myOnMouseUpCallback);
        document.body.removeEventListener("mouseleave", this._myOnMouseLeaveCallback);
        document.body.removeEventListener("contextmenu", this._myPreventContextMenuCallback);
        document.body.removeEventListener("mousedown", this._myPreventMiddleButtonScrollCallback);
    }

    isValid() {
        return this._myIsValid;
    }

    isButtonPressed(buttonID) {
        let isPressed = false;

        if (this._myButtonInfos.has(buttonID)) {
            isPressed = this._myButtonInfos.get(buttonID).myIsPressed;
        }

        return isPressed;
    }

    isButtonPressStart(buttonID) {
        let isPressStart = false;

        if (this._myButtonInfos.has(buttonID)) {
            isPressStart = this._myButtonInfos.get(buttonID).myIsPressStart;
        }

        return isPressStart;
    }

    isButtonPressEnd(buttonID = null) {
        let isPressEnd = false;

        if (this._myButtonInfos.has(buttonID)) {
            isPressEnd = this._myButtonInfos.get(buttonID).myIsPressEnd;
        }

        return isPressEnd;
    }

    isMoving() {
        return this._myIsMoving;
    }

    isInsideView() {
        return this._myIsInsideView;
    }

    setContextMenuActive(active) {
        if (this._myContextMenuActive != active) {
            if (active) {
                document.body.removeEventListener("contextmenu", this._myPreventContextMenuCallback);
            } else {
                document.body.addEventListener("contextmenu", this._myPreventContextMenuCallback, false);
            }
            this._myContextMenuActive = active;
        }
    }

    setMiddleButtonScrollActive(active) {
        if (this._myMiddleButtonScrollActive != active) {
            if (active) {
                document.body.removeEventListener("mousedown", this._myPreventMiddleButtonScrollCallback);
            } else {
                document.body.addEventListener("mousedown", this._myPreventMiddleButtonScrollCallback, false);
            }
            this._myMiddleButtonScrollActive = active;
        }
    }

    getPositionScreen(out = PP.vec2_create()) {
        let mousePosition = out;
        mousePosition[0] = this._myInternalMousePosition[0];
        mousePosition[1] = this._myScreenSize[1] - 1 - this._myInternalMousePosition[1];
        return mousePosition;
    }

    getPositionScreenNormalized(out = PP.vec2_create()) {
        let mousePosition = out;
        mousePosition[0] = (this._myScreenSize[0] == 0) ? 0 : ((this._myInternalMousePosition[0] / this._myScreenSize[0]) * 2 - 1);
        mousePosition[1] = (this._myScreenSize[1] == 0) ? 0 : (((this._myScreenSize[1] - 1 - this._myInternalMousePosition[1]) / this._myScreenSize[1]) * 2 - 1);
        return mousePosition;
    }

    getScreenSize() {
        return this._myScreenSize;
    }

    getPositionWorld(distanceFromCamera, out = PP.vec3_create()) {
        let originWorld = this.getOriginWorld(this._myOriginWorld);
        let directionWorld = this.getDirectionWorld(this._myDirectionWorld);

        out = originWorld.vec3_add(directionWorld.vec3_scale(distanceFromCamera, out), out);
        return out;
    }

    getOriginWorld(out = PP.vec3_create()) {
        if (PP.XRUtils.isXRSessionActive()) {
            PP.myPlayerObjects.myEyeLeft.pp_getPosition(out); // in theory mouse should not be used inside the session, but may make sense for AR which uses eye left
        } else {
            PP.myPlayerObjects.myNonVRCamera.pp_getPosition(out);
        }

        return out;
    }

    getDirectionWorld(out = PP.vec3_create()) {
        let right = this._myInternalMousePosition[0] / this._myScreenSize[0];
        let up = this._myInternalMousePosition[1] / this._myScreenSize[1];

        let directionLocal = out;
        directionLocal.vec3_set(right * 2 - 1, -up * 2 + 1, -1.0);

        let projectionMatrixInvert = this._myProjectionMatrixInverse;
        if (PP.XRUtils.isXRSessionActive()) {
            projectionMatrixInvert = PP.myPlayerObjects.myEyeLeft.pp_getComponentHierarchy("view").projectionMatrix.mat4_invert(projectionMatrixInvert);
        } else {
            projectionMatrixInvert = PP.myPlayerObjects.myNonVRCamera.pp_getComponentHierarchy("view").projectionMatrix.mat4_invert(projectionMatrixInvert);
        }

        directionLocal.vec3_transformMat4(projectionMatrixInvert, directionLocal);
        directionLocal.vec3_normalize(directionLocal);

        let directionWorld = directionLocal;
        if (PP.XRUtils.isXRSessionActive()) {
            directionWorld = directionLocal.vec3_transformQuat(PP.myPlayerObjects.myEyeLeft.pp_getRotationQuat(this._myRotationQuat), directionLocal);
        } else {
            directionWorld = directionLocal.vec3_transformQuat(PP.myPlayerObjects.myNonVRCamera.pp_getRotationQuat(this._myRotationQuat), directionLocal);
        }

        directionWorld.vec3_normalize(directionWorld);

        return out;
    }

    // the origin and direction are set by the mouse
    raycastWorld(raycastSetup, raycastResult = new PP.RaycastResult()) {
        this.getOriginWorld(raycastSetup.myOrigin);
        this.getDirectionWorld(raycastSetup.myDirection);
        raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);
        return raycastResult;
    }

    setResetMovingDelay(delay) {
        this._myResetMovingDelay = delay;
    }

    getResetMovingDelay() {
        return this._myResetMovingDelay;
    }

    _updatePositionAndScreen(event) {
        this._updateScreenSize();
        this._myInternalMousePosition[0] = event.clientX;
        this._myInternalMousePosition[1] = event.clientY;

        this._myIsValid = true;
    }

    _onMouseMove(event) {
        this._myResetMovingTimer.start(this._myResetMovingDelay);
        this._myIsMoving = true;

        this._updatePositionAndScreen(event);
    }

    _onMouseDown(event) {
        let buttonInfo = this._myButtonInfos.get(event.button);
        if (!buttonInfo.myIsPressed) {
            buttonInfo.myIsPressed = true;
            buttonInfo.myIsPressStartToProcess = true;
        }

        this._updatePositionAndScreen(event);
    }

    _onMouseUp(event) {
        let buttonInfo = this._myButtonInfos.get(event.button);
        if (buttonInfo.myIsPressed) {
            buttonInfo.myIsPressed = false;
            buttonInfo.myIsPressEndToProcess = true;
        }

        this._updatePositionAndScreen(event);
    }

    _onMouseLeave(event) {
        this._myIsInsideView = false;

        for (let buttonInfo of this._myButtonInfos.values()) {
            if (buttonInfo.myIsPressed) {
                buttonInfo.myIsPressed = false;
                buttonInfo.myIsPressEndToProcess = true;
            }
        }
    }

    _onMouseEnter(event) {
        this._myIsInsideView = true;

        for (let buttonInfo of this._myButtonInfos.values()) {
            if (buttonInfo.myIsPressed) {
                buttonInfo.myIsPressed = false;
                buttonInfo.myIsPressEndToProcess = true;
            }
        }
    }

    _preventContextMenu(event) {
        event.preventDefault();
    }

    _preventMiddleButtonScroll(event) {
        if (event.button == 1) {
            event.preventDefault();
            return false;
        }
    }

    _updateScreenSize() {
        let bounds = document.body.getBoundingClientRect();
        this._myScreenSize[0] = bounds.width;
        this._myScreenSize[1] = bounds.height;
    }
};