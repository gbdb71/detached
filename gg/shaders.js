"use strict";

GG.Shaders = {
    loadProgram: function (gl, fragmentShaderUrl, vertexShaderUrl, onSuccess, onError) {
        GG.Files.loadString(fragmentShaderUrl, function (fragment_shader_source) {
            GG.Files.loadString(vertexShaderUrl, function (vertex_shader_source) {
                // XXX: lost context
                var program = undefined;
                var fragment_shader = GG.Shaders.createShader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);
                var vertex_shader = GG.Shaders.createShader(gl, gl.VERTEX_SHADER, vertex_shader_source);
                if (fragment_shader !== undefined && vertex_shader !== undefined)
                    program = GG.Shaders.createProgram(gl, fragment_shader, vertex_shader);
                if (program !== undefined)
                    onSuccess(program);
                else if (onError !== undefined)
                    onError("Failed creating program");
                else
                    console.error("Failed creating program");
            });
        });
    },
    createShader: function (gl, shaderType, source) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return undefined;
        } else
            return shader;
    },
    createProgram: function (gl, fragmentShader, vertexShader) {
        var program = gl.createProgram();
        gl.attachShader(program, fragmentShader);
        gl.attachShader(program, vertexShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return undefined;
        } else
            return program;
    }
};
