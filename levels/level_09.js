"use strict";

Game.Levels.push({
    level: [
        {x: -1, y: 0, type: "exit"},
        {x: 0, y: 0, type: "ground"},
        {x: 1, y: 0, type: "ground"},
        {x: 2, y: 0, type: "ground"},
        {x: 3, y: 0, type: "ground"},
        {x: 4, y: 0, type: "ground"},
        {x: 5, y: 0, type: "ground"},
        {x: 6, y: 0, type: "ground"},
        {x: 7, y: 0, type: "ground"},
        {x: 2, y: 1, type: "ground"},
        {x: 3, y: 1, type: "wall"},
        {x: 4, y: 1, type: "ground"},
        {x: 5, y: 1, type: "ground"}
    ],
    player: {
        x: 7, y: 0, expectedColor: "red"
    },
    npcs: [
        {x: 6, y: 0, bottom: "blue", middle: "green", top: "blue"},
        {x: 4, y: 0, bottom: "red", middle: "green", top: "red"},
        {x: 2, y: 0, bottom: "green", middle: "blue", top: "green"}
    ]
});
