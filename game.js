"use strict";

var Game = {
    config: {
        canvasWidth: 880, // 1280
        canvasHeight: 495, // 720
        ticksPerSecond: 120,
        maxTicksPerDraw: 6,
        keyboardMapping: {
            27: "cancel",
            32: "enter",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            67: "cancel",
            88: "enter"
        }
    },
    lerp4: function (a, b, t) {
        return [
            a[0] * (1 - t) + b[0] * t,
            a[1] * (1 - t) + b[1] * t,
            a[2] * (1 - t) + b[2] * t,
            a[3] * (1 - t) + b[3] * t
        ]
    },
    random: function (min, max) {
        return min + Math.random() * (max - min)
    },
    randomPick: function (list) {
        return list[Math.floor(Math.random() * list.length)];
    },
    makeTriangle: function (cellX, cellY, bottomColor, middleColor, topColor, level, markOccupied) {
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
                color: bottomColor
            },
            middle: {
                x: 0, y: 8, angle: Game.random(-0.05, 0.05), scale: 1,
                transform: undefined,
                color: middleColor
            },
            top: {
                x: 0, y: 35 + 8, angle: Game.random(-0.07, 0.07), scale: 1,
                transform: undefined,
                color: topColor
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
                triangle_top_overlay: undefined,
                fill: undefined
            },
            time: 0,
            background: [0.15, 0.03, 0.16],
            camera: {
                x: 0, y: 0, angle: 0, scale: 1280 / Game.config.canvasWidth,
                targetX: 0, targetY: 0, targetScale: 1280 / Game.config.canvasWidth
            },
            level: {
                nextLevel: 0,
                width: 0,
                height: 0,
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
                red: [0.6, 0.1, 0.1, 1.0],
                green: [0.2, 0.4, 0.7, 1.0],
                blue: [0.2, 0.7, 0.1, 1.0]
            }
        };

        Game.loadLevel(state);

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
            state.meshes.quad_4096 = GG.Meshes.createQuadVAO(state.gl, state.vaoExtension, state.shader.attributes.position, state.shader.attributes.uv, 4096, 4096);
        });

        Object.keys(state.textures).forEach(function (textureName) {
            GG.Textures.loadImage(gl, "textures/" + textureName + ".png", function (texture) {
                state.textures[textureName] = texture;
            });
        });

        GG.Loop.run(canvas, Game.config.ticksPerSecond, Game.config.maxTicksPerDraw, Game.config.keyboardMapping, Game.tick, Game.draw, state);
        return state;
    },
    loadLevel: function (state) {
        var definition = Game.Levels[state.level.nextLevel];

        state.level.state = "load";
        state.level.loadTime = state.time;

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

        state.level.cells = [];
        definition.level.forEach(function (cellDefinition) {
            state.level.cells.push(createCell(cellDefinition.x, cellDefinition.y, cellDefinition.type));
        });
        state.level.cells.sort(function (a, b) {
            if (a.y == b.y)
                return a.x - b.x;
            else
                return a.y - b.y;
        });

        var minX = Infinity;
        var maxX = -Infinity;
        var minY = Infinity;
        var maxY = -Infinity;
        state.level.index = {};
        for (var i = 0; i < state.level.cells.length; ++i) {
            var cell = state.level.cells[i];
            state.level.index[cell.cellX + "_" + cell.cellY] = cell;
            if (cell.type !== "exit") {
                minX = Math.min(minX, cell.cellX);
                maxX = Math.max(maxX, cell.cellX);
                minY = Math.min(minY, cell.cellY);
                maxY = Math.max(maxY, cell.cellY);
            }
        }

        state.level.width = maxX - minX + 1;
        state.level.height = maxY - minY + 1;

        state.level.centerX = 0.5 * (minX + maxX + 1) * state.level.cellSize;
        state.level.centerY = 0.5 * (minY + maxY + 1)* state.level.cellSize;

        state.npcs = [];
        definition.npcs.forEach(function (npcDefinition) {
            state.npcs.push(Game.makeTriangle(npcDefinition.x, npcDefinition.y, npcDefinition.bottom, npcDefinition.middle, npcDefinition.top, state.level, true));
        });

        if (state.player == undefined)
            state.player = Game.makeTriangle(definition.player.x, definition.player.y, "red", "green", "blue", state.level, false);
        else {
            state.player.cellX = definition.player.x;
            state.player.cellY = definition.player.y;
            state.player.x = (definition.player.x + 0.5) * state.level.cellSize;
            state.player.y = (definition.player.y + 0.5) * state.level.cellSize;
            state.player.targetX = state.player.x;
            state.player.targetY = state.player.y;
        }

        state.camera.targetX = state.player.x;
        state.camera.targetY = state.player.y;
        state.camera.targetScale = 512 / Game.config.canvasWidth;
        state.camera.x = state.player.x;
        state.camera.y = state.player.y;
    },
    tick: function (state, frameTime, keyboardInput) {
        state.time += frameTime;

        if (state.level.state === "win" && (state.time - state.level.winTime) > 1) {
            state.level.nextLevel = (state.level.nextLevel + 1) % Game.Levels.length;
            Game.loadLevel(state);
        }

        if (state.level.state === "load" && (state.time - state.level.loadTime) > 1) {
            state.level.state = "move";
            state.camera.targetX = state.level.centerX;
            state.camera.targetY = state.level.centerY;
            state.camera.targetScale = 1280 / Game.config.canvasWidth;
        }

        var player = state.player;

        player.x = player.targetX * 0.2 + player.x * 0.8;
        player.y = player.targetY * 0.2 + player.y * 0.8;
        state.npcs.forEach(function (npc) {
            npc.x = npc.targetX * 0.2 + npc.x * 0.8;
            npc.y = npc.targetY * 0.2 + npc.y * 0.8;
        });

        if (state.level.state !== "win" && state.level.state !== "load") {
            if (Math.abs(player.x - player.targetX) < 2 && Math.abs(player.y - player.targetY) < 2) {
                player.x = player.targetX;
                player.y = player.targetY;

                if (state.level.state !== "win" && state.level.index[player.cellX + "_" + player.cellY].type === "exit") {
                    state.level.state = "win";
                    state.camera.targetX = player.x;
                    state.camera.targetY = player.y;
                    state.camera.targetScale = 512 / Game.config.canvasWidth;
                    state.level.winTime = state.time;
                }
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
                        var isMovingOntoExit = nextMove.type === "exit" && state.level.index[nextMove.x + "_" + nextMove.y].isOpen;
                        if (nextMove.type === "ground" || isMovingOntoExit) {
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
                    lastCell = {x: player.cellX, y: player.cellY, occupiedBy: undefined, type: undefined};
                if (lastCell.occupiedBy === undefined || lastCell.type === "exit") { // TODO: fix microbug here on level end
                    var newCell = {
                        x: lastCell.x + movementX,
                        y: lastCell.y + movementY,
                        occupiedBy: undefined,
                        type: undefined
                    };
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
            gl.uniform4f(state.shader.uniforms.tint, 1, 1, 1, 1);
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

            if (state.level.state !== "win")
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

            if (state.level.state === "win" || state.level.state === "load") {
                GG.Transforms.toMat3(state.player.transform, model);
                gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
                state.vaoExtension.bindVertexArrayOES(state.meshes.quad_4096);
                if (state.level.state === "win")
                    gl.uniform4f(state.shader.uniforms.tint, state.background[0], state.background[1], state.background[2], Math.min(1.0, state.time - state.level.winTime));
                else
                    gl.uniform4f(state.shader.uniforms.tint, state.background[0], state.background[1], state.background[2], 1.0 - Math.min(1.0, state.time - state.level.loadTime));

                gl.bindTexture(gl.TEXTURE_2D, state.textures.fill);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                state.vaoExtension.bindVertexArrayOES(state.meshes.quad_128);
                drawTriangle(state.player, state.level.state === "swap" ? state.level.swapPart : undefined);
            }
        }

        function drawTriangle(triangle, highlightedPart) {
            var bottomColor = state.colors[triangle.bottom.color];
            var middleColor = state.colors[triangle.middle.color];
            var topColor = state.colors[triangle.top.color];

            GG.Transforms.toMat3(triangle.bottom.transform, model);
            gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
            if (highlightedPart === "bottom")
                gl.uniform4fv(state.shader.uniforms.tint, Game.lerp4(bottomColor, [1, 1, 1, 1], 0.5 + 0.25 * Math.sin(8 * state.time)));
            else
                gl.uniform4fv(state.shader.uniforms.tint, bottomColor);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_bottom_mask);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.uniform4f(state.shader.uniforms.tint, 1, 1, 1, 1);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_bottom_overlay);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            GG.Transforms.toMat3(triangle.middle.transform, model);
            gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
            if (highlightedPart === "middle")
                gl.uniform4fv(state.shader.uniforms.tint, Game.lerp4(middleColor, [1, 1, 1, 1], 0.5 + 0.25 * Math.sin(8 * state.time)));
            else
                gl.uniform4fv(state.shader.uniforms.tint, middleColor);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_middle_mask);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.uniform4f(state.shader.uniforms.tint, 1, 1, 1, 1);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_middle_overlay);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            GG.Transforms.toMat3(triangle.top.transform, model);
            gl.uniformMatrix3fv(state.shader.uniforms.model, false, model);
            if (highlightedPart === "top")
                gl.uniform4fv(state.shader.uniforms.tint, Game.lerp4(topColor, [1, 1, 1, 1], 0.5 + 0.25 * Math.sin(8 * state.time)));
            else
                gl.uniform4fv(state.shader.uniforms.tint, topColor);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_top_mask);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.uniform4f(state.shader.uniforms.tint, 1, 1, 1, 1);
            gl.bindTexture(gl.TEXTURE_2D, state.textures.triangle_top_overlay);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

    }
};
