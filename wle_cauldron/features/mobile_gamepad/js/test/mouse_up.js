WL.registerComponent("mouse-up", {
}, {
    init: function () {
    },
    update: function () {
        console.error(PP.myMouse.isButtonPressed(PP.MouseButtonType.LEFT), PP.myMouse.getScreenSize()[0]);
    },
});