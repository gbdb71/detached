"use strict";

GG.Loop = {
    run: function (element, ticksPerSecond, maxTicksPerDraw, keyboardMapping, tickFunction, drawFunction, state) {
        var frameTimeSecond = 1 / ticksPerSecond;
        var frameTimeMillisecond = 1000 / ticksPerSecond;
        var lastTimeMillisecond = undefined;
        var unusedTimeMillisecond = frameTimeMillisecond;
        var wasTooSlow = false;
        var keyboardInput = GG.Loop.initKeyboardInput(keyboardMapping);
        var mouseInput = GG.Loop.initMouseInput(element);

        function runLoop(time_ms) {
            if (lastTimeMillisecond === undefined)
                unusedTimeMillisecond = frameTimeMillisecond;
            else
                unusedTimeMillisecond += time_ms - lastTimeMillisecond;
            lastTimeMillisecond = time_ms;
            var ticks = 0;
            var isTooSlow = false;
            try {
                while (unusedTimeMillisecond >= frameTimeMillisecond) {
                    if (ticks < maxTicksPerDraw) {
                        tickFunction(state, frameTimeSecond, keyboardInput, mouseInput, wasTooSlow);
                        mouseInput.justPressed = false;
                        mouseInput.justReleased = false;
                    } else
                        isTooSlow = true;
                    unusedTimeMillisecond -= frameTimeMillisecond;
                    ++ticks;
                }
                drawFunction(state, wasTooSlow);
                wasTooSlow = isTooSlow;
            } finally {
                requestAnimationFrame(runLoop, element);
            }
        }

        requestAnimationFrame(runLoop, element);
    },
    initMouseInput: function(element) {
        var mouse = {
            x: 0,
            y: 0,
            justPressed: false,
            justReleased: false,
            pressed: false
        };
        element.addEventListener('mousemove', function (event) {
            var x = event.offsetX !== undefined ? event.offsetX : event.layerX;
            var y = event.offsetY !== undefined ? event.offsetY : event.layerY;
            mouse.x = x;
            mouse.y = y;
        });

        element.addEventListener('mousedown', function (event) {
            if (event.button == 0 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                mouse.justPressed = true;
                mouse.pressed = true;
            }
        });

        element.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });

        document.addEventListener('mouseup', function (event) {
            if (event.button == 0) {
                mouse.justReleased = true;
                mouse.pressed = false;
            }
        });
        return mouse;
    },
    initKeyboardInput: function (mapping) {
        var downKeys = {};
        var input = {};
        window.addEventListener("keydown", function (e) {
            if (e.ctrlKey || e.metaKey || e.altKey)
                return;
            if (mapping.hasOwnProperty(e.keyCode)) {
                if (!downKeys[e.keyCode]) {
                    downKeys[e.keyCode] = true;
                    input[mapping[e.keyCode]] = true;
                }
                e.preventDefault();
            } else {
                console.log(e.keyCode);
            }
        });

        window.addEventListener("keyup", function (e) {
            if (mapping.hasOwnProperty(e.keyCode)) {
                downKeys[e.keyCode] = false;
                input[mapping[e.keyCode]] = false;
                e.preventDefault();
            }
        });
        return input;
    }
};
