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
        {x: 7, y: 0, type: "ground"},
        {x: 3, y: 1, type: "wall"}
    ],
    player: {
        x: 7, y: 0
    },
    npcs: [
        {x: 3, y: 1, bottom: "blue", middle: "green", top: "blue", isTalker: true, message: "good_luck"}
    ]
});
