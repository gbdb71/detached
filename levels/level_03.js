"use strict";

Game.Levels.push({
    "player": {
        "x": 7,
        "y": 0,
        "expectedColor": "orange"
    },
    "npcs": [
        {
            "x": 3,
            "y": 1,
            "bottom": "green",
            "middle": "blue",
            "top": "blue",
            "isTalker": false
        },
        {
            "x": 3,
            "y": 0,
            "bottom": "green",
            "middle": "magenta",
            "top": "magenta",
            "isTalker": false
        },
        {
            "x": 3,
            "y": -1,
            "bottom": "magenta",
            "middle": "red",
            "top": "red",
            "isTalker": false
        }
    ],
    "level": [
        {
            "x": 3,
            "y": 1,
            "type": "ground"
        },
        {
            "x": 4,
            "y": 1,
            "type": "ground"
        },
        {
            "x": 5,
            "y": 1,
            "type": "ground"
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
            "type": "wall"
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
            "x": 3,
            "y": -1,
            "type": "ground"
        },
        {
            "x": 4,
            "y": -1,
            "type": "ground"
        },
        {
            "x": 5,
            "y": -1,
            "type": "ground"
        }
    ]
});
