"use strict";

GG.Loop = {
    run: function (element, ticksPerSecond, maxTicksPerDraw, keyboardMapping, tickFunction, drawFunction, state) {
        var frameTimeSecond = 1 / ticksPerSecond;
        var frameTimeMillisecond = 1000 / ticksPerSecond;
        var lastTimeMillisecond = undefined;
        var unusedTimeMillisecond = frameTimeMillisecond;
        var wasTooSlow = false;
        var keyboardInput = GG.Loop.initKeyboardInput(keyboardMapping);

        function runLoop(time_ms) {
            if (lastTimeMillisecond === undefined)
                unusedTimeMillisecond = frameTimeMillisecond;
            else
                unusedTimeMillisecond += time_ms - lastTimeMillisecond;
            lastTimeMillisecond = time_ms;
            var ticks = 0;
            var isTooSlow = false;
            while (unusedTimeMillisecond >= frameTimeMillisecond) {
                if (ticks < maxTicksPerDraw)
                    tickFunction(state, frameTimeSecond, keyboardInput, wasTooSlow);
                else
                    isTooSlow = true;
                unusedTimeMillisecond -= frameTimeMillisecond;
                ++ticks;
            }
            drawFunction(state, wasTooSlow);
            wasTooSlow = isTooSlow;
            requestAnimationFrame(runLoop, element);
        }

        requestAnimationFrame(runLoop, element);
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
