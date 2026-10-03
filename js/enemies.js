/* enemies.js — fileiras em zigue-zague descendo devagar, 1 tiro por vez */
(function () {
  var W = 480;

  function createWave(level) {
    var waveIdx = (level - 1) % window.WAVES.length;
    var meta = window.WAVES[waveIdx];
    // dificuldade escala por nível
    var speedMul = Math.pow(1.15, level - 1);
    var cols = level === 1 ? 6 : (level % 3 === 0 ? 8 : 7);
    var rows = level < 3 ? 2 : 3;
    var list = [];
    var sx = 52, sy = 44;
    var ox = W / 2 - ((cols - 1) * sx) / 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        list.push({
          gx: ox + c * sx, gy: 70 + r * sy, // grade base
          x: ox + c * sx, y: 70 + r * sy,
          alive: true, phase: (c + r) * 0.6,
          w: 30, h: 26
        });
      }
    }
    return {
      meta: meta, level: level, enemies: list,
      t: 0,
      zigAmp: 40 + Math.min(60, level * 6),
      zigSpeed: (0.9 + level * 0.12) * Math.min(speedMul, 2.5),
      descend: (10 + level * 2.2) * Math.min(speedMul, 2.2), // px/s devagar
      baseY: 0,
      shootTimer: 1.2,
      shootInterval: Math.max(0.45, 1.4 - level * 0.12),
      maxEnemyBullets: level < 3 ? 1 : (level < 5 ? 2 : 3),
      bullets: [] // pool pequeno
    };
  }

  function initBullets(wave) {
    wave.bullets.length = 0;
    for (var i = 0; i < 6; i++) wave.bullets.push({ x: 0, y: 0, active: false, w: 6, h: 12 });
  }

  function aliveCount(w) {
    var n = 0;
    for (var i = 0; i < w.enemies.length; i++) if (w.enemies[i].alive) n++;
    return n;
  }

  function update(w, dt) {
    w.t += dt;
    w.baseY += w.descend * dt;
    // loop: se desceu demais, volta ao topo (estilo Megamania)
    var lowest = 0;
    for (var i = 0; i < w.enemies.length; i++) {
      var e = w.enemies[i];
      if (!e.alive) continue;
      e.x = e.gx + Math.sin(w.t * w.zigSpeed + e.phase) * w.zigAmp;
      e.y = e.gy + w.baseY;
      if (e.y > lowest) lowest = e.y;
    }
    if (lowest > 480) w.baseY = -40; // reseta descida

    // balas inimigas: poucas, uma de cada vez
    w.shootTimer -= dt;
    var activeEB = 0, j;
    for (j = 0; j < w.bullets.length; j++) {
      var b = w.bullets[j];
      if (!b.active) continue;
      activeEB++;
      b.y += (170 + w.level * 12) * dt;
      if (b.y > 660) b.active = false;
    }
    if (w.shootTimer <= 0 && activeEB < w.maxEnemyBullets) {
      var shooters = [];
      for (j = 0; j < w.enemies.length; j++) if (w.enemies[j].alive) shooters.push(w.enemies[j]);
      if (shooters.length) {
        var s = shooters[(Math.random() * shooters.length) | 0];
        for (j = 0; j < w.bullets.length; j++) {
          var bb = w.bullets[j];
          if (!bb.active) { bb.active = true; bb.x = s.x; bb.y = s.y + 14; break; }
        }
        w.shootTimer = w.shootInterval * (0.7 + Math.random() * 0.6);
        if (window.SFX) window.SFX.enemyShoot();
      }
    }
  }

  function draw(ctx, w) {
    var img = window.SPRITES[w.meta.key];
    for (var i = 0; i < w.enemies.length; i++) {
      var e = w.enemies[i];
      if (!e.alive) continue;
      window.drawSprite(ctx, img, e.x, e.y, 2);
    }
    ctx.fillStyle = w.meta.color;
    for (var k = 0; k < w.bullets.length; k++) {
      var b = w.bullets[k];
      if (!b.active) continue;
      ctx.fillRect(Math.round(b.x - 3), Math.round(b.y - 6), 6, 12);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(Math.round(b.x - 1), Math.round(b.y - 6), 2, 12);
      ctx.fillStyle = w.meta.color;
    }
  }

  window.EnemySys = { createWave: createWave, initBullets: initBullets, aliveCount: aliveCount, update: update, draw: draw };
})();
