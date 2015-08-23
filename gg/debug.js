"use strict";

GG.Debug = {
    tweak: function (parent, property, min, max) {
        var value = document.createElement("span");
        var input = document.createElement("input");
        input.type = "range";
        input.setAttribute("min", min);
        input.setAttribute("max", max);
        input.setAttribute("step", (max - min) * 0.001);
        input.addEventListener("input", function (e) {
            parent[property] = e.target.valueAsNumber;
            value.innerText = e.target.value;
        });

        var label = document.createElement("label");
        label.className = "gg-debug-field";
        label.textContent = property + "\u2005:";
        label.appendChild(input);
        label.appendChild(value);

        function update() {
            if (input.value !== parent[property]) {
                value.textContent = parent[property].toPrecision(5);
                input.setAttribute("value", parent[property]);
            }
            requestAnimationFrame(update, label);
        }

        if (document.getElementById("gg-debug-fields") == null) {
            var fields = document.createElement("div");
            fields.setAttribute("id", "gg-debug-fields");
            document.body.appendChild(fields);
        }
        document.getElementById("gg-debug-fields") .appendChild(label);

        update();
    }
};
