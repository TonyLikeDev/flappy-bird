
- Impact juice. Screen shake and a burst of feathers on collision. Right now the white flash reads more like a rendering glitch than a crash.
- Score pop. Scale the digits up briefly each time you clear a pipe. Makes every point feel earned instead of silently incrementing.
- Medals. Bronze through platinum at fixed thresholds on the scoreboard. The asset pack has no medal art, so I would draw them on canvas as shaded discs.
- New best badge. A small flag when you beat your record. One of the strongest "one more go" triggers in any score chaser.

Changes the shape of a run, around 80 lines

- Difficulty ramp. Narrow the gap and raise the scroll speed over the first thirty pipes. My autopilot survived 66 seconds at the current flat difficulty, so runs have no climax. Worth flagging that this is a deliberate departure, since the original game keeps difficulty constant forever.
- Progression through art you already own. The day and night backgrounds are currently picked at random once per run. Tie them to score instead, switching to night with red pipes partway through, and the background becomes a progress bar.

Real depth, around 150 lines each

- Ghost bird. A translucent replay of your best run flying beside you. This is the one I would build first among the larger ideas. The fixed timestep already in the loop makes replay exact, so recording the frame number of each flap reproduces the run perfectly.
- Near-miss bonus. Extra points for threading a gap close to the edge, with its own sound. Turns a binary pass or fail into a risk decision, which is what gives the game a skill ceiling.
- Daily challenge. Seed the pipe generator from the date so everyone flies an identical course. Cheap to build, and it gives people something to compare.
