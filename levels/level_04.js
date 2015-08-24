"use strict";

Game.Levels.push({
    "player": {
        "x": 7,
        "y": 0,
        "expectedColor": "magenta"
    },
    "npcs": [
        {
            "x": 5,
            "y": 0,
            "bottom": "red",
            "middle": "green",
            "top": "blue",
            "isTalker": false
        },
        {
            "x": 3,
            "y": 1,
            "bottom": "green",
            "middle": "orange",
            "top": "blue",
            "isTalker": false
        },
        {
            "x": 3,
            "y": -1,
            "bottom": "orange",
            "middle": "red",
            "top": "green",
            "isTalker": false
        }
    ],
    "level": [
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
            "x": -1,
            "y": 0,
            "type": "exit"
        },
        {
            "x": 0,
            "y": 0,
            "type": "ground"
        },
        {
            "x": 1,
            "y": 0,
            "type": "ground"
        },
        {
            "x": 2,
            "y": 0,
            "type": "ground"
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
            "type": "ground"
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
        }
    ]
});
