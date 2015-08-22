"use strict";

GG.Transforms = {
    createTRS: function (x, y, angle, scale) {
        return [
            [scale * Math.cos(angle), scale * -Math.sin(angle), x],
            [scale * Math.sin(angle), scale * Math.cos(angle), y]
        ];
    },
    createTRSInverse: function (x, y, angle, scale) {
        var inverseScale = 1 / scale;
        var sc = inverseScale * Math.cos(-angle);
        var ss = inverseScale * Math.sin(-angle);
        return [
            [sc, -ss, sc * -x + -ss * -y],
            [ss, sc, ss * -x + sc * -y]
        ];
    },
    createOrtho: function (width, height) {
        return [
            [2 / width, 0, 0],
            [0, 2 / height, 0]
        ];
    },
    multiply: function (a, b) {
        // a is the parent
        return [
            [
                a[0][0] * b[0][0] + a[0][1] * b[1][0],
                a[0][0] * b[0][1] + a[0][1] * b[1][1],
                a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2]
            ],
            [
                a[1][0] * b[0][0] + a[1][1] * b[1][0],
                a[1][0] * b[0][1] + a[1][1] * b[1][1],
                a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2]
            ]
        ]
    },
    apply: function (transform, x, y) {
        return [
            transform[0][0] * x + transform[0][1] * y + transform[0][2],
            transform[1][0] * x + transform[1][1] * y + transform[1][2]
        ];
    },
    toMat3: function (transform, mat3) {
        mat3[0] = transform[0][0];
        mat3[1] = transform[1][0];
        mat3[2] = 0;
        mat3[3] = transform[0][1];
        mat3[4] = transform[1][1];
        mat3[5] = 0;
        mat3[6] = transform[0][2];
        mat3[7] = transform[1][2];
        mat3[8] = 1;
    }
};
