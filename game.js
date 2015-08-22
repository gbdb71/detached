"use strict";

var Game = {
    config: {
        canvasWidth: 880, // 1280
        canvasHeight: 495, // 720
        ticksPerSecond: 120,
        maxTicksPerDraw: 6,
        keyboardMapping: {
            32: "jump",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            65: "cancel",
            81: "cancel",
            87: "enter",
            90: "enter"
        }
    },
    lerp3: function (a, b, t) {
        return [
            a[0] * (1 - t) + b[0] * t,
            a[1] * (1 - t) + b[1] * t,
            a[2] * (1 - t) + b[2] * t
        ]
    },
    random: function (min, max) {
        return min + Math.random() * (max - min)
    },
    randomPick: function (list) {
        return list[Math.floor(Math.random() * list.length)];
    },
    makeTriangle: function (cellX, cellY, level, colors, markOccupied) {
        var x = (cellX + 0.5) * level.cellSize;
        var y = (cellY + 0.5) * level.cellSize;
        var triangle = {
            x: x, y: y, angle: 0, scale: 1,
            transform: undefined,
            cellX: cellX, cellY: cellY,
            targetX: x, targetY: y,
            nextMoves: [],
            bottom: {
                x: 0, y: -31 + 8, angle: Game.random(-0.03, 0.03), scale: 1,
                transform: undefined,
                color: Game.randomPick(Object.keys(colors))
            },
            middle: {
                x: 0, y: 8, angle: Game.random(-0.05, 0.05), scale: 1,
                transform: undefined,
                color: Game.randomPick(Object.keys(colors))
            },
            top: {
                x: 0, y: 35 + 8, angle: Game.random(-0.07, 0.07), scale: 1,
                transform: undefined,
                color: Game.randomPick(Object.keys(colors))
            }
        };
        if (markOccupied)
            level.index[cellX + "_" + cellY].occupiedBy = triangle;
        return triangle;
    },
    start: function (canvas) {
        canvas.setAttribute("width", Game.config.canvasWidth);
        canvas.setAttribute("height", Game.config.canvasHeight);

        // TODO: check for gl failure
        // TODO: check/test for lost context
        var gl = canvas.getContext("webgl", {alpha: false}) || canvas.getContext("experimental-webgl", {alpha: false});

        var state = {
            gl: gl,
            vaoExtension: gl.getExtension("OES_vertex_array_object"),
            shader: {
                program: undefined,
                attributes: {
                    position: undefined,
                    uv: undefined
                },
                uniforms: {
                    model: undefined,
                    view: undefined,
                    sampler: undefined,
                    time: undefined,
                    tint: undefined
                }
            },
            meshes: {
                quad_128: undefined,
                quad_256: undefined
            },
            textures: {
                ground: undefined,
                wall: undefined,
                exit_closed: undefined,
                exit_open: undefined,
                triangle_bottom_mask: undefined,
                triangle_middle_mask: undefined,
                triangle_top_mask: undefined,
                triangle_bottom_overlay: undefined,
                triangle_middle_overlay: undefined,
                triangle_top_overlay: undefined
            },
            time: 0,
            background: [0.15, 0.03, 0.16],
            camera: {
                x: 0, y: 0, angle: 0, scale: 1280 / Game.config.canvasWidth,
                targetX: 0, targetY: 0, targetScale: 1280 / Game.config.canvasWidth
            },
            level: {
                width: 9,
                height: 5,
                cellSize: 128,
                cells: [],
                index: {},
                centerX: 0,
                centerY: 0,
                state: "move",
                swapPart: "top",
                swapNpc: undefined
            },
            player: undefined,
            npcs: [],
            colors: {
                red: [0.6, 0.1, 0.1],
                green: [0.2, 0.4, 0.7],
                blue: [0.2, 0.7, 0.1]
            }
        };

        // Build a random "level" for now
        state.level.centerX = 0.5 * state.level.width * state.level.cellSize;
        state.level.centerY = 0.5 * state.level.height * state.level.cellSize;
        state.level.cells = [];

        function createCell(x, y, type) {
            var cell = {
                type: type,
                x: (x + 0.5) * state.level.cellSize,
                y: (y + 0.5) * state.level.cellSize,
                angle: 0,
                scale: 1,
                transform: undefined,
                cellX: x,
                cellY: y,
                occupiedBy: undefined,
                isOpen: true
            };
            cell.transform = GG.Transforms.createTRS(cell.x, cell.y, cell.angle, cell.scale);
            return cell;
        }

        for (var y = state.level.height - 1; y >= 0; --y)
            for (var x = 0; x < state.level.width; ++x)
                state.level.cells.push(createCell(x, y, ((x + y * 2) % 5) < 2 ? "wall" : "ground"));
        state.level.cells.push(createCell(-1, 4, "exit"));
        state.level.index = {};
        for (var i = 0; i < state.level.cells.length; ++i) {
            var cell = state.level.cells[i];
            state.level.index[cell.cellX + "_" + cell.cellY] = cell;
        }

        state.npcs.push(Game.makeTriangle(5, 2, state.level, state.colors, true));
        state.npcs.push(Game.makeTriangle(3, 3, state.level, state.colors, true));
        state.player = Game.makeTriangle(3, 2, state.level, state.colors, false);

        state.camera.targetX = state.level.centerX;
        state.camera.targetY = state.level.centerY;
        state.camera.x = state.camera.targetX;
        state.camera.y = state.camera.targetY;

        GG.Shaders.loadProgram(gl, "shaders/fragment.glsl", "shaders/vertex.glsl", function (program) {
            state.shader.program = program;
            Object.keys(state.shader.attributes).forEach(function (key) {
                state.shader.attributes[key] = state.gl.getAttribLocation(program, key);
            });
            Object.keys(state.shader.uniforms).forEach(function (key) {
                state.shader.uniforms[key] = state.gl.getUniformLocation(program, key);
            });
            state.meshes.quad_128 = GG.Meshes.createQuadVAO(state.gl, state.vaoExtension, state.shader.attributes.position, state.shader.attributes.uv, 128, 128);
            state.meshes.quad_256 = GG.Meshes.createQuadVAO(state.gl, state.vaoExtension, state.shader.attributes.position, state.shader.attributes.uv, 256, 256);
        });

        Object.keys(state.textures).forEach(function (textureName) {
            GG.Textures.loadImage(gl, "textures/" + textureName + ".png", function (texture) {
                state.textures[textureName] = texture;
            });
        });

        GG.Loop.run(canvas, Game.config.ticksPerSecond, Game.config.maxTicksPerDraw, Game.config.keyboardMapping, Game.tick, Game.draw, state);
        return state;
    },
    tick: function (state, frameTime, keyboardInput) {
        state.time += frameTime;

        var player = state.player;

        player.x = player.targetX * 0.2 + player.x * 0.8;
        player.y = player.targetY * 0.2 + player.y * 0.8;
        state.npcs.forEach(function (npc) {
            npc.x = npc.targetX * 0.2 + npc.x * 0.8;
            npc.y = npc.targetY * 0.2 + npc.y * 0.8;
        });

        {
            if (Math.abs(player.x - player.targetX) < 2 && Math.abs(player.y - player.targetY) < 2) {
                player.x = player.targetX;
                player.y = player.targetY;
                var neighbors = [
                    {x: player.cellX - 1, y: player.cellY},
                    {x: player.cellX + 1, y: player.cellY},
                    {x: player.cellX, y: player.cellY - 1},
                    {x: player.cellX, y: player.cellY + 1}
                ];
                var isNearExit = false;
                neighbors.forEach(function (neighbor) {
                    var cellIndex = neighbor.x + "_" + neighbor.y;
                    if (cellIndex in state.level.index) {
                        var cell = state.level.index[cellIndex];
                        if (cell.type === "exit") {
                            isNearExit = true;
                            state.camera.targetX = state.level.centerX * 0.9 + player.x * 0.1;
                            state.camera.targetY = state.level.centerY * 0.9 + player.y * 0.1;
                            state.camera.targetScale = 1280 / Game.config.canvasWidth;
                            if (cell.isOpen) {
                                if (player.bottom.color !== player.middle.color || player.middle.color !== player.top.color)
                                    cell.isOpen = false;
                            }
                        }
                    }
                });
                if (!isNearExit && state.level.state === "move") {
                    state.camera.targetX = state.level.centerX;
                    state.camera.targetY = state.level.centerY;
                    state.camera.targetScale = 1280 / Game.config.canvasWidth;
                }
                if (player.nextMoves.length > 0) {
                    var nextMove = player.nextMoves[0];
                    var nextX = (nextMove.x + 0.5) * state.level.cellSize;
                    var nextY = (nextMove.y + 0.5) * state.level.cellSize;
                    if (nextMove.occupiedBy !== undefined) {
                        state.camera.targetX = 0.5 * (player.x + nextX);
                        state.camera.targetY = 0.5 * (player.y + nextY);
                        state.camera.targetScale = 700 / Game.config.canvasWidth;
                        state.level.state = "swap";
                        state.level.swapNpc = nextMove.occupiedBy;
                    } else {
                        if (nextMove.type !== "exit" || state.level.index[nextMove.x + "_" + nextMove.y].isOpen) {
                            player.cellX = nextMove.x;
                            player.cellY = nextMove.y;
                            // TODO: make targetX/Y implicit ?
                            player.targetX = nextX;
                            player.targetY = nextY;
                        }
                    }
                    player.nextMoves.splice(0, 1);

                    state.level.cells.forEach(function (cell) {
                        if (cell.type === "exit" && !cell.isOpen) {
                            cell.isOpen = true;
                        }
                    });
                }
            }
        }
        if (state.level.state === "move") {
            var movementX = 0;
            var movementY = 0;
            if (keyboardInput.left) {
                movementX -= 1;
                keyboardInput.left = false;
            }
            if (keyboardInput.right) {
                movementX += 1;
                keyboardInput.right = false;
            }
            if (keyboardInput.down) {
                movementY -= 1;
                keyboardInput.down = false;
            }
            if (keyboardInput.up) {
                movementY += 1;
                keyboardInput.up = false;
            }
            if (movementX !== 0)
                movementY = 0;
            if (movementX !== 0 || movementY !== 0) {
                var lastCell;
                if (player.nextMoves.length > 0)
                    lastCell = player.nextMoves[player.nextMoves.length - 1];
                else
                    lastCell = {x: player.cellX, y: player.cellY, occupiedBy: undefined, type:undefined};
                if (lastCell.occupiedBy === undefined || lastCell.type === "exit") { // TODO: fix microbug here on level end
                    var newCell = {x: lastCell.x + movementX, y: lastCell.y + movementY, occupiedBy: undefined, type:undefined};
                    var newCellIndex = newCell.x + "_" + newCell.y;
                    if (state.level.index.hasOwnProperty(newCellIndex)) {
                        var cell = state.level.index[newCellIndex];
                        newCell.type = cell.type;
                        if (cell.type === "ground" || cell.type === "exit") {
                            newCell.occupiedBy = cell.occupiedBy;
                            player.nextMoves.push(newCell);
                        }
                    }
                }
            }
        } else if (state.level.state === "swap") {
            if (keyboardInput.cancel) {
                keyboardInput.cancel = false;
                state.camera.targetX = state.level.centerX;
                state.camera.targetY = state.level.centerY;
                state.camera.targetScale = 1280 / Game.config.canvasWidth;
                state.level.state = "move";
            } else if (keyboardInput.enter) {
                var npc = state.level.swapNpc;

                var tmp = player[state.level.swapPart].color;
                player[state.level.swapPart].color = npc[state.level.swapPart].color;
                npc[state.level.swapPart].color = tmp;

                state.level.index[npc.cellX + "_" + npc.cellY].occupiedBy = undefined;
                state.level.index[player.cellX + "_" + player.cellY].occupiedBy = npc;
                ["targetX", "targetY", "cellX", "cellY"].forEach(function (key) {
                    var tmp = player[key];
                    player[key] = npc[key];
                    npc[key] = tmp;
                });

                state.camera.targetX = state.level.centerX;
                state.camera.targetY = state.level.centerY;
                state.camera.targetScale = 1280 / Game.config.canvasWidth;
                state.level.state = "move";
            } else {
                if (keyboardInput.up) {
                    keyboardInput.up = false;
                    if (state.level.swapPart === "bottom")
                        state.level.swapPart = "middle";
                    else if (state.level.swapPart === "middle")
                        state.level.swapPart = "top";
                }
                if (keyboardInput.down) {
                    keyboardInput.down = false;
                    if (state.level.swapPart === "middle")
                        state.level.swapPart = "bottom";
                    else if (state.level.swapPart === "top")
                        state.level.swapPart = "middle";
                }
            }
        }

        function updateTriangle(triangle) {
            triangle.transform = GG.Transforms.createTRS(triangle.x, triangle.y, triangle.angle, triangle.scale);
            triangle.bottom.transform = GG.Transforms.multiply(
                triangle.transform,
                GG.Transforms.createTRS(triangle.bottom.x, triangle.bottom.y, triangle.bottom.angle, triangle.bottom.scale));
            triangle.middle.transform = GG.Transforms.multiply(
                triangle.transform,
                GG.Transforms.createTRS(triangle.middle.x, triangle.middle.y, triangle.middle.angle, triangle.middle.scale));
            triangle.top.transform = GG.Transforms.multiply(
                triangle.transform,
                GG.Transforms.createTRS(triangle.top.x, triangle.top.y, triangle.top.angle, triangle.top.scale));
        }

        updateTriangle(player);
        for (var i = 0; i < state.npcs.length; ++i)
            updateTriangle(state.npcs[i]);

        var camera = state.camera;
        camera.x = camera.targetX * 0.1 + camera.x * 0.9;
        camera.y = camera.targetY * 0.1 + camera.y * 0.9;
        camera.scale = camera.targetScale * 0.1 + camera.scale * 0.9;
    },
    draw: function (state) {
        var gl = state.gl;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(state.background[0], state.background[1], state.background[2], 1);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (state.shader.program !== undefined) {
            gl.useProgram(state.shader.program);
            gl.uniform1f(state.shader.uniforms.time, state.time);
            gl.uniform3f(state.shader.uniforms.tint, 1, 1, 1);
            if (state.textures.sample !== undefined) {
                gl.uniform1i(state.shader.uniforms.sampler, 0);
                gl.activeTexture(gl.TEXTURE0);
            }

            var view = new Float32Array(9);
            var camera = state.camera;
            var cameraTransform = GG.Transforms.createTRSInverse(camera.x, camera.y, camera.angle, camera.scale);
            var projection = GG.Transforms.createOrtho(gl.canvas.clientWidth, gl.canvas.clientHeight);
            cameraTransform = GG.Transforms.multiply(projection, cameraTransform);
            GG.Transforms.toMat3(cameraTransform, view);

            gl.uniformMatrix3fv(state.shader.uniforms.view, false, view);
            var model = new Float32Array(9);

            state.vaoExtension.bindVertexArrayOES(state.meshes.quad_128);
            for (var i = 0; i < state.level.cells.length; ++i) {
                var cell = state.level.cells[i];
                if (cell.type == "exit") {
                    if (cell.isOpen)
                        gl.bindTexture(gl.TEXTURE_2D, state.textures.exit_open);
                    else
                        gl.bindTexture(gl.TEXTURE_2D, state.textures.exit_closed);
                    GG.Transforms.toMat3(cell.transform, model);
                    gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                }
            }

            state.vaoExtension.bindVertexArrayOES(state.meshes.quad_128);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.ground);
            for (i = 0; i < state.level.cells.length; ++i) {
                cell = state.level.cells[i];
                if (cell.type == "ground") {
                    GG.Transforms.toMat3(cell.transform, model);
                    gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                }
            }

            state.vaoExtension.bindVertexArrayOES(state.meshes.quad_128);
            for (i = 0; i < state.npcs.length; ++i) {
                var npc = state.npcs[i];
                drawTriangle(npc, state.level.state === "swap" && npc == state.level.swapNpc ? state.level.swapPart : undefined);
            }
            drawTriangle(state.player, state.level.state === "swap" ? state.level.swapPart : undefined);

            state.vaoExtension.bindVertexArrayOES(state.meshes.quad_256);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.wall);
            for (i = 0; i < state.level.cells.length; ++i) {
                cell = state.level.cells[i];
                if (cell.type == "wall") {
                    GG.Transforms.toMat3(cell.transform, model);
                    gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                }
            }
        }

        function drawTriangle(triangle, highlightedPart) {
            var bottomColor = state.colors[triangle.bottom.color];
            var middleColor = state.colors[triangle.middle.color];
            var topColor = state.colors[triangle.top.color];

            GG.Transforms.toMat3(triangle.bottom.transform, model);
            gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
            if (highlightedPart === "bottom")
                gl.uniform3fv(state.shader.uniforms.tint, Game.lerp3(bottomColor, [1, 1, 1], 0.5 + 0.25 * Math.sin(8 * state.time)));
            else
                gl.uniform3fv(state.shader.uniforms.tint, bottomColor);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_bottom_mask);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.uniform3f(state.shader.uniforms.tint, 1, 1, 1);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_bottom_overlay);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            GG.Transforms.toMat3(triangle.middle.transform, model);
            gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
            if (highlightedPart === "middle")
                gl.uniform3fv(state.shader.uniforms.tint, Game.lerp3(middleColor, [1, 1, 1], 0.5 + 0.25 * Math.sin(8 * state.time)));
            else
                gl.uniform3fv(state.shader.uniforms.tint, middleColor);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_middle_mask);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.uniform3f(state.shader.uniforms.tint, 1, 1, 1);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_middle_overlay);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            GG.Transforms.toMat3(triangle.top.transform, model);
            gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
            if (highlightedPart === "top")
                gl.uniform3fv(state.shader.uniforms.tint, Game.lerp3(topColor, [1, 1, 1], 0.5 + 0.25 * Math.sin(8 * state.time)));
            else
                gl.uniform3fv(state.shader.uniforms.tint, topColor);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_top_mask);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.uniform3f(state.shader.uniforms.tint, 1, 1, 1);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_top_overlay);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

    }
};
