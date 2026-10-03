/* audio.js — SFX sintetizados via Web Audio (sem arquivos) */
(function () {
  var ctx = null;

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Laser agudo: square 1400Hz -> 200Hz em 0.12s
  function laser() {
    var ac = ensure(); if (!ac) return;
    var t = ac.currentTime;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + 0.14);
  }

  // Tiro inimigo: pew grave
  function enemyShoot() {
    var ac = ensure(); if (!ac) return;
    var t = ac.currentTime;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(400, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.2);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + 0.21);
  }

  // Explosão "crushing": noise burst + lowpass + crush
  function explosion(big) {
    var ac = ensure(); if (!ac) return;
    var t = ac.currentTime;
    var dur = big ? 0.5 : 0.35;
    var len = Math.floor(ac.sampleRate * dur);
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6);
    }
    var src = ac.createBufferSource(); src.buffer = buf;
    var filt = ac.createBiquadFilter(); filt.type = 'lowpass';
    filt.frequency.setValueAtTime(3000, t);
    filt.frequency.exponentialRampToValueAtTime(120, t + dur);
    var g = ac.createGain();
    g.gain.setValueAtTime(big ? 0.35 : 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filt); filt.connect(g); g.connect(ac.destination);
    src.start(t);
    // camada "crush": square grave
    var o = ac.createOscillator(), g2 = ac.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(35, t + dur * 0.8);
    g2.gain.setValueAtTime(0.12, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g2); g2.connect(ac.destination);
    o.start(t); o.stop(t + dur);
  }

  function levelClear() {
    var ac = ensure(); if (!ac) return;
    var t = ac.currentTime;
    [523, 659, 784, 1046].forEach(function (f, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.09, t + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.12);
      o.connect(g); g.connect(ac.destination);
      o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.13);
    });
  }

  window.SFX = {
    unlock: ensure, laser: laser, enemyShoot: enemyShoot,
    explosion: explosion, levelClear: levelClear
  };
})();
