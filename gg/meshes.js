"use strict";

GG.Meshes = {
    createQuad: function (gl, positionAttribute, uvAttribute, width, height, xAlign, yAlign) {
        if (xAlign === undefined)
            xAlign = 0.5;
        if (yAlign === undefined)
            yAlign = 0.5;
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
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return {
            buffer: buffer,
            stride: 4 * 4,
            positionAttribute: positionAttribute,
            uvAttribute: uvAttribute,
            positionOffset: 0,
            uvOffset: 4 * 2
        };
    },
    bindMesh: function(gl, mesh) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
        gl.enableVertexAttribArray(mesh.positionAttribute);
        gl.enableVertexAttribArray(mesh.uvAttribute);
        gl.vertexAttribPointer(mesh.positionAttribute, 2, gl.FLOAT, false, mesh.stride, mesh.positionOffset);
        gl.vertexAttribPointer(mesh.uvAttribute, 2, gl.FLOAT, false, mesh.stride, mesh.uvOffset);
    }
};
