# Game config examples

## Snake

**game_config example**

* game: snake
* speed: how fast the snake is (bigger the number slower the snake)
* targetSnakeLength: how many 'apples' snake needs to eat

```json
{
    "default": {
        "game": "snake",
        "speed": 8,
        "targetSnakeLength": 16,
        "endDescription": "All shield segments fixed!",
        "initDescription": "<p>Front shield generator shield segments are dirty.</p>\n\t\t<p>Clean up all faulty segments by collecting (red) 'apples' with the remote-controlled snake cleaner. After enough dirt has been cleaned the system will become operational.</p>"
    },
    "skill:master": {
        "game": "snake",
        "speed": 12,
        "targetSnakeLength": 12,
        "endDescription": "All shield segments fixed!",
        "initDescription": "<p>Front shield generator shield segments are dirty.</p>\n\t\t<p>Clean up all faulty segments by collecting (red) 'apples' with the remote-controlled snake cleaner. After enough dirt has been cleaned the system will become operational.</p>"
    },
    "skill:expert": {
        "game": "snake",
        "speed": 16,
        "targetSnakeLength": 8,
        "endDescription": "All shield segments fixed!",
        "initDescription": "<p>Front shield generator shield segments are dirty.</p>\n\t\t<p>Clean up all faulty segments by collecting (red) 'apples' with the remote-controlled snake cleaner. After enough dirt has been cleaned the system will become operational.</p>"
    }
}
```

## Nonogram

**game_config example**

* game: nonogram
* gridWidth: grid width
* gridHeight: grid height
* maxStrikes: how many faulty segments are accepted before they need to redo the task

```json
{
    "default": {
        "game": "nonogram",
        "gridWidth": 5,
        "gridHeight": 7,
        "maxStrikes": 3,
        "endDescription": "All shield segments fixed!",
        "initDescription": "<p>Front shield generator shield segments are faulted.</p>\n\t\t<p>You need to find all faulty segments so that EVA can recalibrate using functional segments. Try to avoid faulty ones. When all functional segments are found the recalibration can begin. Each number on the lines outside the grid represents a block of squares to be blacked out in that row or column</p>\n\t\t<p>You may reset the shield segments to a random state.</p>"
    },
    "skill:master": {
        "game": "nonogram",
        "gridWidth": 5,
        "gridHeight": 5,
        "maxStrikes": 3,
        "endDescription": "All shield segments fixed!",
        "initDescription": "<p>Front shield generator shield segments are faulted.</p>\n\t\t<p>You need to find all faulty segments so that EVA can recalibrate using functional segments. Try to avoid faulty ones. When all functional segments are found the recalibration can begin. Each number on the lines outside the grid represents a block of squares to be blacked out in that row or column</p>\n\t\t<p>You may reset the shield segments to a random state.</p>"
    },
    "skill:expert": {
        "game": "nonogram",
        "gridWidth": 4,
        "gridHeight": 4,
        "maxStrikes": 3,
        "endDescription": "All shield segments fixed!",
        "initDescription": "<p>Front shield generator shield segments are faulted.</p>\n\t\t<p>You need to find all faulty segments so that EVA can recalibrate using functional segments. Try to avoid faulty ones. When all functional segments are found the recalibration can begin. Each number on the lines outside the grid represents a block of squares to be blacked out in that row or column</p>\n\t\t<p>You may reset the shield segments to a random state.</p>"
    }
}
```