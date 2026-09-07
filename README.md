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
| `sprites/` | Birds in three colours, a Goku sprite, green and red pipes, day and night backgrounds, ground, score digits, title and game over art |
| `audio/` | Wing, point, hit, die and swoosh, as both WAV and OGG |
| `favicon.ico`, `screenshot.png` | Page icon and a preview image |

## Characters

The ready screen has a character picker. Tap a tile, or use the left and right
arrow keys, to fly as one of the three birds or as either Goku. The first tile is
"surprise me", which rolls a random character each round. Your choice is
remembered between sessions.

There are two Gokus. One flies on the Flying Nimbus, from the 32x32 frames
`songoku.png`, `songoku2.png` and `songoku3.png`. The other flies under his
own power, from the 34x24 frames `goku-downflap.png`, `goku-midflap.png` and
`goku-upflap.png`, drawn in the birds' own 17x12 at 2x style.

Every character is drawn centred on the same hitbox, so sprites of different
sizes all collide identically. Goku is a Dragon Ball character owned by his
rights holders, so he belongs here as fan art rather than licensed content.

The night background with red pipes still comes up about a third of the time.

## Credits

Assets originally collected by
[Samuel Custodio](https://github.com/samuelcust/flappy-bird-assets).
The artwork and sound come from the original Flappy Bird by .GEARS, so treat
them as fan or educational use rather than freely relicensable material.

## License

The code here is MIT. See [LICENSE](LICENSE).
