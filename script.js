(() => {
  const K = (c, l, w = 1, h = 1) => ({ c, l, w, h });
  const F = n => K('F' + n, 'F' + n);
  const layout = [];
  const row = (y, items) => {
    let x = 0;
    for (const it of items) {
      if (typeof it === 'number') { x += it; continue; }
      layout.push({ ...it, x, y });
      x += it.w;
    }
  };
  const nav = (a, b, c) => [.5, K(a[0], a[1]), K(b[0], b[1]), K(c[0], c[1])];
  const np = (...a) => a.map(([c, l, w, h]) => K(c, l, w, h));

  row(0, [K('Escape', 'Échap'), 1, F(1), F(2), F(3), F(4), .5, F(5), F(6), F(7), F(8), .5, F(9), F(10), F(11), F(12),
    .5, K('PrintScreen', 'Impr'), K('ScrollLock', 'Arrêt'), K('Pause', 'Pause')]);

  row(1.5, [K('Backquote', '²'), K('Digit1', '1|&'), K('Digit2', '2|é'), K('Digit3', '3|"'), K('Digit4', "4|'"),
    K('Digit5', '5|('), K('Digit6', '6|-'), K('Digit7', '7|è'), K('Digit8', '8|_'), K('Digit9', '9|ç'),
    K('Digit0', '0|à'), K('Minus', ')'), K('Equal', '='), K('Backspace', 'Retour', 2),
    ...nav(['Insert', 'Inser'], ['Home', 'Début'], ['PageUp', 'Pg ↑']), .5,
    ...np(['NumLock', 'Verr'], ['NumpadDivide', '/'], ['NumpadMultiply', '*'], ['NumpadSubtract', '-'])]);

  row(2.5, [K('Tab', 'Tab', 1.5), ...'AZERTYUIOP'.split('').map((l, i) => K('Key' + 'QWERTYUIOP'[i], l)),
    K('BracketLeft', '^'), K('BracketRight', '$'), K('Backslash', '*', 1.5),
    ...nav(['Delete', 'Suppr'], ['End', 'Fin'], ['PageDown', 'Pg ↓']), .5,
    ...np(['Numpad7', '7'], ['Numpad8', '8'], ['Numpad9', '9'], ['NumpadAdd', '+', 1, 2])]);

  row(3.5, [K('CapsLock', 'Verr maj', 1.75), ...'QSDFGHJKL'.split('').map((l, i) => K('Key' + 'ASDFGHJKL'[i], l)),
    K('Semicolon', 'M'), K('Quote', 'ù'), K('Enter', 'Entrée', 2.25),
    .5, 3, .5, ...np(['Numpad4', '4'], ['Numpad5', '5'], ['Numpad6', '6'])]);

  row(4.5, [K('ShiftLeft', 'Maj', 1.25), K('IntlBackslash', '<'), K('KeyZ', 'W'), K('KeyX', 'X'), K('KeyC', 'C'),
    K('KeyV', 'V'), K('KeyB', 'B'), K('KeyN', 'N'), K('KeyM', ','), K('Comma', ';'), K('Period', ':'),
    K('Slash', '!'), K('ShiftRight', 'Maj', 2.75), .5, 1, K('ArrowUp', '↑'), 1, .5,
    ...np(['Numpad1', '1'], ['Numpad2', '2'], ['Numpad3', '3'], ['NumpadEnter', 'Entrée', 1, 2])]);

  row(5.5, [K('ControlLeft', 'Ctrl', 1.25), K('MetaLeft', 'Win', 1.25), K('AltLeft', 'Alt', 1.25),
    K('Space', '', 6.25), K('AltRight', 'Alt Gr', 1.25), K('MetaRight', 'Win', 1.25),
    K('ContextMenu', 'Menu', 1.25), K('ControlRight', 'Ctrl', 1.25),
    .5, K('ArrowLeft', '←'), K('ArrowDown', '↓'), K('ArrowRight', '→'), .5,
    K('Numpad0', '0', 2), K('NumpadDecimal', ',')]);

  /* ---------- Construction du clavier ---------- */
  const keysEl = document.getElementById('keys');
  const els = {};
  for (const k of layout) {
    const key = document.createElement('div');
    key.className = 'key';
    key.style.cssText = `--x:${k.x};--y:${k.y};--w:${k.w};--h:${k.h}`;
    const cap = document.createElement('div');
    cap.className = 'cap';
    const parts = k.l.split('|');
    if (parts.length === 2) {
      cap.innerHTML = `<span class="top">${parts[0]}</span><span>${parts[1]}</span>`;
    } else if (k.l) {
      cap.innerHTML = `<span>${k.l}</span>`;
    }
    key.appendChild(cap);
    keysEl.appendChild(key);
    els[k.c] = key;
    key.addEventListener('pointerdown', e => { e.preventDefault(); press(k.c); });
    key.addEventListener('pointerup', () => release(k.c));
    key.addEventListener('pointerleave', () => release(k.c));
    key.addEventListener('pointercancel', () => release(k.c));
  }

  /* ---------- Son (synthétisé, aucun fichier audio) ---------- */
  let ctx, noise, muted = false;
  const heavy = new Set(['Space', 'Enter', 'NumpadEnter', 'Backspace', 'ShiftLeft', 'ShiftRight', 'CapsLock', 'Tab']);

  function audio() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function sound(code, up) {
    if (muted) return;
    const c = audio(), t = c.currentTime, big = heavy.has(code), v = up ? 0.3 : 1;

    const src = c.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.9 + Math.random() * 0.25;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = (big ? 1500 : 2600) + Math.random() * 600;
    bp.Q.value = 0.9;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7 * v, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.07 : 0.045));
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t);
    src.stop(t + 0.1);

    const o = c.createOscillator(), og = c.createGain();
    o.type = 'sine';
    const f = (big ? 120 : 190) + Math.random() * 25;
    o.frequency.setValueAtTime(f * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.5 * v, t + 0.003);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(og).connect(c.destination);
    o.start(t);
    o.stop(t + 0.09);
  }

  /* ---------- Appui / relâchement ---------- */
  const down = new Set();
  function press(code) {
    if (down.has(code)) return;
    down.add(code);
    if (els[code]) els[code].classList.add('down');
    sound(code, false);
  }
  function release(code) {
    if (!down.has(code)) return;
    down.delete(code);
    if (els[code]) els[code].classList.remove('down');
    sound(code, true);
  }

  addEventListener('keydown', e => {
    if (!e.ctrlKey && !e.metaKey) e.preventDefault();
    press(e.code);
  });
  addEventListener('keyup', e => release(e.code));
  addEventListener('blur', () => [...down].forEach(release));

  /* ---------- Contrôles ---------- */
  document.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
    document.body.dataset.theme = b.dataset.theme;
    document.querySelectorAll('.choice').forEach(x => x.classList.toggle('active', x === b));
    b.blur();
  }));
  const muteBtn = document.getElementById('mute');
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? 'Son : coupé' : 'Son : activé';
    muteBtn.blur();
  });

  /* ---------- Adaptation à la largeur de l'écran ---------- */
  const board = document.getElementById('board'), stage = document.getElementById('stage');
  function fit() {
    board.style.transform = 'none';
    const w = board.offsetWidth, h = board.offsetHeight;
    const s = Math.min(1, (innerWidth - 24) / w);
    board.style.transform = `scale(${s})`;
    stage.style.height = h * s + 'px';
    board.style.marginRight = board.style.marginLeft = '';
    stage.style.width = '100%';
    board.style.width = w + 'px';
    if (s < 1) { board.style.transformOrigin = 'top left'; stage.style.justifyContent = 'flex-start'; stage.style.paddingLeft = '12px'; }
    else { board.style.transformOrigin = 'top center'; stage.style.justifyContent = 'center'; stage.style.paddingLeft = ''; }
  }
  addEventListener('resize', fit);
  fit();
})();

