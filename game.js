(() => {
  'use strict';

  // ---------------------------------------------------------------- constants
  const W = 288, H = 512;          // logical resolution (matches the sprites)
  const GROUND_Y = 400;            // top of the scrolling base
  const STEP = 1000 / 60;          // fixed physics timestep

  const GRAVITY    = 0.42;
  const FLAP       = -5.6;
  const MAX_FALL   = 10;
  const SPEED      = 2.0;          // world scroll, px per tick
  const BIRD_X     = 60;
  const PIPE_W     = 52;
  const PIPE_H     = 320;
  const PIPE_GAP   = 100;
  const PIPE_SPACE = 172;          // horizontal distance between pipe pairs
  const GAP_MIN    = 80;
  const GAP_MAX    = GROUND_Y - PIPE_GAP - 90;

  const READY = 0, PLAYING = 1, DYING = 2, OVER = 3;

  // ------------------------------------------------------------------ loading
  const SPRITES = [
    '0','1','2','3','4','5','6','7','8','9',
    'background-day','background-night','base','gameover','message',
    'pipe-green','pipe-red',
    'yellowbird-downflap','yellowbird-midflap','yellowbird-upflap',
    'redbird-downflap','redbird-midflap','redbird-upflap',
    'bluebird-downflap','bluebird-midflap','bluebird-upflap',
    'goku-downflap','goku-midflap','goku-upflap',
  ];
  const SOUNDS = ['wing', 'point', 'hit', 'die', 'swoosh'];

  const img = {};
  const sfx = {};

  function loadImage(name) {
    return new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => { img[name] = el; resolve(); };
      el.onerror = () => reject(new Error('sprites/' + name + '.png'));
      el.src = 'sprites/' + name + '.png';
    });
  }

  // Prefer ogg where the browser supports it, fall back to wav (Safari).
  const audioExt = new Audio().canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'wav';

  function loadSound(name) {
    const el = new Audio('audio/' + name + '.' + audioExt);
    el.preload = 'auto';
    sfx[name] = el;
  }

  function play(name) {
    const base = sfx[name];
    if (!base) return;
    // Clone so overlapping plays (rapid flaps) don't cut each other off.
    const node = base.cloneNode();
    node.volume = 0.4;
    node.play().catch(() => {});   // ignore autoplay rejections
  }

  // -------------------------------------------------------------------- state
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Everything you can fly as, plus a "surprise me" tile at the front.
  const PLAYABLE = ['yellowbird', 'redbird', 'bluebird', 'goku'];
  const TILES = ['random'].concat(PLAYABLE);

  let state = READY;
  let bird, pipes, score, best, groundX, frame, flash, bgName, pipeName, birdName;
  let picked;

  best = Number(localStorage.getItem('flappyBest') || 0);
  try { picked = localStorage.getItem('flappyChar') || 'random'; } catch (e) { picked = 'random'; }
  if (TILES.indexOf(picked) === -1) picked = 'random';

  function applyPick() {
    birdName = picked === 'random'
      ? PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)]
      : picked;
  }

  function choose(id) {
    if (id === picked && id !== 'random') return;
    picked = id;
    try { localStorage.setItem('flappyChar', id); } catch (e) {}
    applyPick();
    play('swoosh');
  }

  function reset() {
    const night = Math.random() < 0.35;
    bgName   = night ? 'background-night' : 'background-day';
    pipeName = night ? 'pipe-red' : 'pipe-green';
    applyPick();

    bird = { y: H / 2 - 60, vel: 0, rot: 0, wing: 0 };
    pipes = [];
    score = 0;
    groundX = 0;
    frame = 0;
    flash = 0;
    state = READY;
  }

  function spawnPipe(offset = 10) {
    const gapY = GAP_MIN + Math.random() * (GAP_MAX - GAP_MIN);
    pipes.push({ x: W + offset, gapY, scored: false });
  }

  // --------------------------------------------------------------- game logic
  function flap() {
    if (state === READY) {
      state = PLAYING;
      spawnPipe(80);   // clear sky before the first pipe
    }
    if (state !== PLAYING) return;
    bird.vel = FLAP;
    play('wing');
  }

  function die() {
    state = DYING;
    flash = 1;
    play('hit');
    setTimeout(() => play('die'), 220);
    if (score > best) {
      best = score;
      localStorage.setItem('flappyBest', String(best));
    }
  }

  function hitsPipe(p) {
    // Hitbox is inset a couple of pixels so near-misses feel fair.
    const bx = BIRD_X + 2, by = bird.y + 3, bw = 34 - 4, bh = 24 - 6;
    if (bx + bw < p.x || bx > p.x + PIPE_W) return false;
    return by < p.gapY || by + bh > p.gapY + PIPE_GAP;
  }

  function tick() {
    frame++;
    if (flash > 0) flash = Math.max(0, flash - 0.08);

    if (state === READY) {
      bird.y = H / 2 - 60 + Math.sin(frame / 12) * 5;
      bird.rot = 0;
      bird.wing = Math.floor(frame / 6) % 4;
      groundX = (groundX + SPEED) % 48;
      return;
    }

    if (state === PLAYING || state === DYING) {
      bird.vel = Math.min(bird.vel + GRAVITY, MAX_FALL);
      bird.y += bird.vel;
    }

    if (state === PLAYING) {
      bird.wing = Math.floor(frame / 6) % 4;
      groundX = (groundX + SPEED) % 48;

      for (const p of pipes) p.x -= SPEED;
      if (pipes.length && pipes[0].x + PIPE_W < 0) pipes.shift();

      const last = pipes[pipes.length - 1];
      if (!last || last.x < W - PIPE_SPACE) spawnPipe();

      for (const p of pipes) {
        if (!p.scored && p.x + PIPE_W < BIRD_X) {
          p.scored = true;
          score++;
          play('point');
        }
        if (hitsPipe(p)) { die(); break; }
      }

      if (bird.y < -24) { bird.y = -24; bird.vel = 0; }
      if (bird.y + 24 >= GROUND_Y) { bird.y = GROUND_Y - 24; die(); state = OVER; play('swoosh'); }
    }

    if (state === DYING) {
      if (bird.y + 24 >= GROUND_Y) {
        bird.y = GROUND_Y - 24;
        state = OVER;
        play('swoosh');
      }
    }

    // Bird tilt: hold the nose up briefly after a flap, then pitch down.
    let target;
    if (state === PLAYING && bird.vel < 0) target = -25;
    else target = Math.min(90, Math.max(-25, bird.vel * 9));
    bird.rot += (target - bird.rot) * (state === PLAYING ? 0.18 : 0.3);
  }

  // ------------------------------------------------------------------ drawing
  function digitsWidth(str) {
    let w = 0;
    for (const c of str) w += img[c].width + 1;
    return w - 1;
  }

  function drawDigits(str, cx, y, scale = 1) {
    let x = cx - (digitsWidth(str) * scale) / 2;
    for (const c of str) {
      const g = img[c];
      ctx.drawImage(g, Math.round(x), y, g.width * scale, g.height * scale);
      x += (g.width + 1) * scale;
    }
  }

  function panel(x, y, w, h) {
    ctx.fillStyle = '#54544c';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = '#ded895';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.fillRect(x, y, w, 2);
  }

  function outlinedText(text, x, y) {
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#54544c';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
  }

  // ------------------------------------------------------------ character UI
  const TILE_W = 38, TILE_H = 32, TILE_GAP = 6, TILE_Y = 336;
  const TILE_X0 = (W - (TILES.length * TILE_W + (TILES.length - 1) * TILE_GAP)) / 2;

  function tileRect(i) {
    return { x: TILE_X0 + i * (TILE_W + TILE_GAP), y: TILE_Y, w: TILE_W, h: TILE_H };
  }

  function drawPicker() {
    outlinedText('PICK YOUR FLYER', W / 2, 330);
    for (let i = 0; i < TILES.length; i++) {
      const id = TILES[i], r = tileRect(i), on = id === picked;
      // Solid tiles, so dark sprites stay readable over the night background.
      ctx.fillStyle = on ? '#ded895' : '#8f8f86';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = on ? '#ffffff' : '#54544c';
      ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
      if (id === 'random') {
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = on ? '#7a5c34' : '#54544c';
        ctx.fillText('?', r.x + r.w / 2, r.y + r.h / 2 + 7);
      } else {
        ctx.drawImage(img[id + '-midflap'], r.x + 2, r.y + 4);
      }
    }
  }

  // Which tile, if any, is under a tap. Returns -1 for a miss.
  function tileAt(pt) {
    for (let i = 0; i < TILES.length; i++) {
      const r = tileRect(i);
      if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) return i;
    }
    return -1;
  }

  function drawPipe(p) {
    const pipe = img[pipeName];
    // Top pipe: same sprite mirrored vertically, hanging above the gap.
    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.gapY));
    ctx.scale(1, -1);
    ctx.drawImage(pipe, 0, 0);
    ctx.restore();
    ctx.drawImage(pipe, Math.round(p.x), Math.round(p.gapY + PIPE_GAP));
  }

  function render() {
    ctx.drawImage(img[bgName], 0, 0);

    for (const p of pipes) drawPipe(p);

    ctx.drawImage(img.base, Math.round(-groundX), GROUND_Y);

    // Bird
    const frames = ['downflap', 'midflap', 'upflap', 'midflap'];
    const sprite = img[birdName + '-' + frames[bird.wing]];
    ctx.save();
    ctx.translate(BIRD_X + 17, Math.round(bird.y) + 12);
    ctx.rotate((bird.rot * Math.PI) / 180);
    ctx.drawImage(sprite, -17, -12);
    ctx.restore();

    if (state === READY) {
      ctx.drawImage(img.message, (W - 184) / 2, 50);
      drawPicker();
    } else if (state !== OVER) {
      drawDigits(String(score), W / 2, 50);
    }

    if (state === OVER) {
      ctx.drawImage(img.gameover, (W - 192) / 2, 130);

      // Solid scoreboard so the numbers stay readable over any background.
      panel(44, 196, 200, 72);
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#7a5c34';
      ctx.fillText('SCORE', W / 2 - 50, 218);
      ctx.fillText('BEST', W / 2 + 50, 218);
      drawDigits(String(score), W / 2 - 50, 228, 0.6);
      drawDigits(String(best), W / 2 + 50, 228, 0.6);

      outlinedText('TAP OR PRESS SPACE', W / 2, 300);
    }

    if (flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + flash * 0.8 + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  // --------------------------------------------------------------------- loop
  let last = 0, acc = 0;

  function loop(now) {
    if (!last) last = now;
    acc += Math.min(now - last, 250);   // clamp so tab-switches don't fast-forward
    last = now;
    while (acc >= STEP) { tick(); acc -= STEP; }
    render();
    requestAnimationFrame(loop);
  }

  // -------------------------------------------------------------------- input
  // pt is the tap position in logical canvas units, or null for the keyboard.
  function activate(pt) {
    if (state === READY && pt) {
      const i = tileAt(pt);
      if (i !== -1) { choose(TILES[i]); return; }
    }
    if (state === PLAYING || state === READY) flap();
    else if (state === OVER) reset();
  }

  function pointerPos(e) {
    const r = canvas.getBoundingClientRect();
    const p = e.touches && e.touches.length ? e.touches[0] : e;
    return { x: (p.clientX - r.left) * (W / r.width), y: (p.clientY - r.top) * (H / r.height) };
  }

  // Coming back to a backgrounded tab must not fast-forward the physics and
  // teleport the bird into a pipe.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { last = 0; acc = 0; }
  });

  canvas.addEventListener('mousedown', (e) => { e.preventDefault(); activate(pointerPos(e)); });
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); activate(pointerPos(e)); },
                          { passive: false });

  window.addEventListener('keydown', (e) => {
    // Left and right browse the roster while you are still on the ready screen.
    if (state === READY && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
      e.preventDefault();
      const step = e.code === 'ArrowLeft' ? -1 : 1;
      const next = (TILES.indexOf(picked) + step + TILES.length) % TILES.length;
      picked = TILES[next];
      try { localStorage.setItem('flappyChar', picked); } catch (err) {}
      applyPick();
      play('swoosh');
      return;
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      activate(null);
    }
  });

  // ------------------------------------------------------------------- sizing
  function resize() {
    // Fill as much of the viewport as we can. Snap to whole numbers when a
    // whole number is close, so pixel art stays crisp where it can be.
    const raw = Math.min(window.innerWidth / W, (window.innerHeight - 16) / H);
    const scale = raw - Math.floor(raw) > 0.85 ? Math.ceil(raw) : Math.max(1, raw);
    canvas.style.width = Math.round(W * scale) + 'px';
    canvas.style.height = Math.round(H * scale) + 'px';
  }
  window.addEventListener('resize', resize);

  // ------------------------------------------------------------------- start
  Promise.all(SPRITES.map(loadImage))
    .then(() => {
      SOUNDS.forEach(loadSound);
      document.getElementById('loading').remove();
      canvas.hidden = false;
      resize();
      reset();
      requestAnimationFrame(loop);
    })
    .catch((err) => {
      document.getElementById('loading').textContent = 'Failed to load ' + err.message;
    });
})();
