/* player.js — nave inferior, só eixo X, tiro vertical rápido + pooling */
(function () {
  var W = 480, H = 640;

  function createPlayer() {
    return {
      x: W / 2, y: H - 70,
      w: 32, h: 32, // tamanho visual aproximado (16px * scale 2)
      speed: 300,
      cooldown: 0, fireRate: 0.18,
      bullets: [], // pool
      invincible: 0,
      alive: true
    };
  }

  // pool fixo de 20 balas
  function initPool(p) {
    p.bullets.length = 0;
    for (var i = 0; i < 20; i++) {
      p.bullets.push({ x: 0, y: 0, active: false, w: 4, h: 14 });
    }
  }

  function fire(p) {
    if (p.cooldown > 0 || !p.alive) return false;
    for (var i = 0; i < p.bullets.length; i++) {
      var b = p.bullets[i];
      if (!b.active) {
        b.active = true; b.x = p.x; b.y = p.y - 20;
        p.cooldown = p.fireRate;
        return true;
      }
    }
    return false;
  }

  function update(p, dt, input) {
    if (input.left) p.x -= p.speed * dt;
    if (input.right) p.x += p.speed * dt;
    // drag touch: targetX
    if (input.targetX != null) {
      var diff = input.targetX - p.x;
      p.x += diff * Math.min(1, dt * 14);
    }
    if (p.x < 24) p.x = 24;
    if (p.x > W - 24) p.x = W - 24;
    if (p.cooldown > 0) p.cooldown -= dt;
    if (p.invincible > 0) p.invincible -= dt;
    // balas rápidas verticais
    for (var i = 0; i < p.bullets.length; i++) {
      var b = p.bullets[i];
      if (!b.active) continue;
      b.y -= 620 * dt;
      if (b.y < -20) b.active = false;
    }
  }

  function draw(ctx, p, time) {
    if (!p.alive) return;
    // piscar quando invencível
    if (p.invincible > 0 && Math.floor(time * 12) % 2 === 0) return;
    window.drawSprite(ctx, window.SPRITES.player, p.x, p.y, 2);
    // chama do motor
    ctx.fillStyle = '#FF8800';
    var f = 4 + Math.random() * 5;
    ctx.fillRect(Math.round(p.x - 2), Math.round(p.y + 16), 4, f);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(Math.round(p.x - 1), Math.round(p.y + 16), 2, f - 2);
  }

  window.PlayerSys = { createPlayer: createPlayer, initPool: initPool, fire: fire, update: update, draw: draw };
})();
