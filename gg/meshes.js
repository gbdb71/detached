"use strict";

GG.Meshes = {
    createQuadVAO: function (gl, vaoExtension, positionAttribute, uvAttribute, width, height) {
        var vao = vaoExtension.createVertexArrayOES();
        vaoExtension.bindVertexArrayOES(vao);
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.5 * width, 0.5 * height, 1, 0,
            -0.5 * width, 0.5 * height, 0, 0,
            0.5 * width, -0.5 * height, 1, 1,
            -0.5 * width, -0.5 * height, 0, 1
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttribute);
        gl.enableVertexAttribArray(uvAttribute);
        gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 4 * 4, 0);
        gl.vertexAttribPointer(uvAttribute, 2, gl.FLOAT, false, 4 * 4, 4 * 2);
        vaoExtension.bindVertexArrayOES(null);
        return vao;
    }
};
