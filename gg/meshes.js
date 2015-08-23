"use strict";

GG.Meshes = {
    createQuadVAO: function (gl, vaoExtension, positionAttribute, uvAttribute, width, height, xAlign, yAlign) {
        if (xAlign === undefined)
            xAlign = 0.5;
        if (yAlign === undefined)
            yAlign = 0.5;
        var vao = vaoExtension.createVertexArrayOES();
        vaoExtension.bindVertexArrayOES(vao);
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var lowX = (xAlign - 1) * width;
        var highX = xAlign * width;
        var lowY = (yAlign - 1) * height;
        var highY = yAlign * height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            highX, highY, 1, 0,
            lowX, highY, 0, 0,
            highX, lowY, 1, 1,
            lowX, lowY, 0, 1
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttribute);
        gl.enableVertexAttribArray(uvAttribute);
        gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 4 * 4, 0);
        gl.vertexAttribPointer(uvAttribute, 2, gl.FLOAT, false, 4 * 4, 4 * 2);
        vaoExtension.bindVertexArrayOES(null);
        return vao;
    }
};
