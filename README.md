# flappy-bird-assets

Sprites and sound effects for a Flappy Bird clone, plus a playable game built
on them in vanilla JavaScript and HTML5 canvas.

## Play

No build step and no dependencies. Serve the folder and open it:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Tap, click, or press space to flap.
Opening `index.html` straight from disk mostly works, but some browsers block
the audio over `file://`, so a local server is the better bet.

## Contents

| Path | What's in it |
| --- | --- |
| `index.html`, `game.js` | The game |
| `sprites/` | Birds in three colours, green and red pipes, day and night backgrounds, ground, score digits, title and game over art |
| `audio/` | Wing, point, hit, die and swoosh, as both WAV and OGG |
| `favicon.ico`, `screenshot.png` | Page icon and a preview image |

The game picks a bird colour at random each round, and switches to the night
background with red pipes about a third of the time.

## Credits

Assets originally collected by
[Samuel Custodio](https://github.com/samuelcust/flappy-bird-assets).
The artwork and sound come from the original Flappy Bird by .GEARS, so treat
them as fan or educational use rather than freely relicensable material.

## License

The code here is MIT. See [LICENSE](LICENSE).
