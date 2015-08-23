"use strict";

Game.Levels.push({
    level: [
        {x: -2, y: 0, type: "exit"},
        {x: -1, y: 0, type: "ground"},
        {x: 0, y: 0, type: "ground"},
        {x: 1, y: 0, type: "ground"},
        {x: 2, y: 0, type: "ground"},
        {x: 3, y: 0, type: "ground"},
        {x: 4, y: 0, type: "ground"},
        {x: 5, y: 0, type: "ground"},
        {x: 6, y: 0, type: "ground"},
        {x: 7, y: 0, type: "ground"}
    ],
    player: {
        x: 7, y: 0
    },
    npcs: [
        {x: 4, y: 0, bottom: "red", middle: "blue", top: "red"},
        {x: 2, y: 0, bottom: "blue", middle: "green", top: "blue"}
    ]
});
