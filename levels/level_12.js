"use strict";

Game.Levels.push({
    "player": {
        "x": 8,
        "y": 0,
        "expectedColor": "red"
    },
    "npcs": [
        {
            "x": 4,
            "y": 2,
            "bottom": "magenta",
            "middle": "orange",
            "top": "red",
            "isTalker": false
        },
        {
            "x": 4,
            "y": -2,
            "bottom": "red",
            "middle": "orange",
            "top": "magenta",
            "isTalker": false
        },
        {
            "x": 6,
            "y": 0,
            "bottom": "blue",
            "middle": "yellow",
            "top": "blue",
            "isTalker": false
        }
    ],
    "level": [
        {
            "x": 3,
            "y": 2,
            "type": "trap"
        },
        {
            "x": 4,
            "y": 2,
            "type": "ground"
        },
        {
            "x": 5,
            "y": 2,
            "type": "ice"
        },
        {
            "x": 2,
            "y": 1,
            "type": "wall"
        },
        {
            "x": 3,
            "y": 1,
            "type": "ground"
        },
        {
            "x": 4,
            "y": 1,
            "type": "wall"
        },
        {
            "x": 5,
            "y": 1,
            "type": "ice"
        },
        {
            "x": 2,
            "y": 0,
            "type": "exit"
        },
        {
            "x": 3,
            "y": 0,
            "type": "ground"
        },
        {
            "x": 4,
            "y": 0,
            "type": "ground"
        },
        {
            "x": 5,
            "y": 0,
            "type": "ice"
        },
        {
            "x": 6,
            "y": 0,
            "type": "ground"
        },
        {
            "x": 7,
            "y": 0,
            "type": "ground"
        },
        {
            "x": 8,
            "y": 0,
            "type": "ground"
        },
        {
            "x": 2,
            "y": -1,
            "type": "wall"
        },
        {
            "x": 3,
            "y": -1,
            "type": "ground"
        },
        {
            "x": 4,
            "y": -1,
            "type": "wall"
        },
        {
            "x": 5,
            "y": -1,
            "type": "ice"
        },
        {
            "x": 3,
            "y": -2,
            "type": "trap"
        },
        {
            "x": 4,
            "y": -2,
            "type": "ground"
        },
        {
            "x": 5,
            "y": -2,
            "type": "ice"
        }
    ]
});
