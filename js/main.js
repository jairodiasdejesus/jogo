/* main.js — loop, estados, energia, score, colisão, HUD, input desktop+mobile */
(function () {
  var W = 480, H = 640;
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  var elScore = document.getElementById('score');
  var elHi = document.getElementById('hi');
  var elLevel = document.getElementById('level');
  var elLives = document.getElementById('lives');
  var elEnergy = document.getElementById('energyFill');
  var elWave = document.getElementById('waveName');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovSub = document.getElementById('ovSub');
  var ovText = document.getElementById('ovText');
  var btnStart = document.getElementById('btnStart');

  var input = { left: false, right: false, fire: false, targetX: null };
  var autoFire = true; // garante jogabilidade mobile; desktop pode segurar ESPAÇO também

  var state = 'menu'; // menu | playing | levelclear | gameover
  var player = window.PlayerSys.createPlayer();
  window.PlayerSys.initPool(player);
  var wave = window.EnemySys.createWave(1);
  window.EnemySys.initBullets(wave);

  var score = 0, hi = 0, lives = 3, level = 1;
  var energy = 100;
  var ENERGY_DRAIN = 2.8, ENERGY_WAVE_BONUS = 40;
  var particles = [];
  var msgTimer = 0, dieTimer = 0, time = 0;

  try { hi = parseInt(localStorage.getItem('megamania_hi') || '0', 10) || 0; } catch (e) {}
  elHi.textContent = hi;

  function resetGame() {
    score = 0; lives = 3; level = 1; energy = 100;
    player = window.PlayerSys.createPlayer();
    window.PlayerSys.initPool(player);
    wave = window.EnemySys.createWave(1);
    window.EnemySys.initBullets(wave);
    particles.length = 0;
    syncHUD();
  }

  function nextLevel() {
    level++;
    energy = 100; // fase nova renova barra
    player.cooldown = 0;
    wave = window.EnemySys.createWave(level);
    window.EnemySys.initBullets(wave);
    if (window.SFX) window.SFX.levelClear();
    syncHUD();
  }

  function spawnExplosion(x, y, color, n, big) {
    for (var i = 0; i < n; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() * 2 - 1) * (big ? 220 : 150),
        vy: (Math.random() * 2 - 1) * (big ? 220 : 150),
        life: 0.4 + Math.random() * 0.4, t: 0,
        color: Math.random() < 0.3 ? '#FFFFFF' : color,
        size: 2 + (Math.random() * 3 | 0)
      });
    }
  }

  function killPlayer(byEnergy) {
    spawnExplosion(player.x, player.y, '#00FFFF', 34, true);
    if (window.SFX) window.SFX.explosion(true);
    lives--;
    dieTimer = 1.4;
    player.alive = false;
    if (lives <= 0) {
      state = 'gameover';
      if (score > hi) { hi = score; try { localStorage.setItem('megamania_hi', String(hi)); } catch (e) {} }
      showOverlay('GAME OVER', wave.meta.name, 'SCORE ' + score + ' — FASE ' + level + '<br>Toque INICIAR para jogar de novo');
    } else if (byEnergy) {
      energy = 70; // renasce com reserva
    }
    syncHUD();
  }

  function showOverlay(title, sub, text) {
    ovTitle.textContent = title;
    ovSub.textContent = sub;
    ovText.innerHTML = text;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() { overlay.classList.add('hidden'); }

  function syncHUD() {
    elScore.textContent = score;
    elHi.textContent = hi;
    elLevel.textContent = level;
    elLives.textContent = lives;
    elWave.textContent = wave.meta.emoji + ' ' + (level);
    var pct = Math.max(0, Math.min(100, energy));
    elEnergy.style.width = pct + '%';
    elEnergy.classList.toggle('low', pct < 25);
  }

  // ---- input desktop ----
  window.addEventListener('keydown', function (e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
    if (e.code === 'Space') { input.fire = true; e.preventDefault(); }
    if (e.code === 'Enter' && state !== 'playing') startGame();
  });
  window.addEventListener('keyup', function (e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
    if (e.code === 'Space') input.fire = false;
  });

  // ---- touch buttons ----
  function bindHold(id, on, off) {
    var el = document.getElementById(id);
    var start = function (e) { e.preventDefault(); if (window.SFX) window.SFX.unlock(); on(); };
    var end = function (e) { e.preventDefault(); off(); };
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  }
  bindHold('btnLeft', function () { input.left = true; }, function () { input.left = false; });
  bindHold('btnRight', function () { input.right = true; }, function () { input.right = false; });
  bindHold('btnFire', function () { input.fire = true; }, function () { input.fire = false; });

  // ---- arrastar no canvas move a nave ----
  function canvasX(e) {
    var r = canvas.getBoundingClientRect();
    var cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    return (cx - r.left) / r.width * W;
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (window.SFX) window.SFX.unlock();
    input.targetX = canvasX(e);
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (e.buttons || e.pointerType === 'touch') input.targetX = canvasX(e);
  });
  canvas.addEventListener('pointerup', function () { input.targetX = null; });
  canvas.addEventListener('pointercancel', function () { input.targetX = null; });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') { /* pausa implícita: dt é clampado */ }
  });

  btnStart.addEventListener('click', function () { if (window.SFX) window.SFX.unlock(); startGame(); });

  function startGame() {
    resetGame();
    state = 'playing';
    hideOverlay();
  }

  // ---- update ----
  function update(dt) {
    time += dt;
    if (state !== 'playing') {
      // anima partículas do gameover/menu
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i]; p.t += dt;
        if (p.t >= p.life) particles.splice(i, 1);
      }
      return;
    }

    // energia drena sempre
    energy -= ENERGY_DRAIN * dt;
    if (energy <= 0) {
      energy = 0; syncHUD();
      if (player.alive) killPlayer(true);
      if (state !== 'playing') return;
    }

    // player morto: espera respawn
    if (!player.alive) {
      dieTimer -= dt;
      updateParticles(dt);
      if (dieTimer <= 0 && lives > 0) {
        player.alive = true; player.invincible = 2.5;
        player.x = W / 2;
      }
      syncHUD();
      return;
    }

    window.PlayerSys.update(player, dt, input);

    // tiro: automático + manual
    if (autoFire || input.fire) {
      if (window.PlayerSys.fire(player) && window.SFX) window.SFX.laser();
    }

    window.EnemySys.update(wave, dt);

    // player bullets x enemies
    var bullets = player.bullets;
    for (var b = 0; b < bullets.length; b++) {
      var pb = bullets[b];
      if (!pb.active) continue;
      var pbox = window.Collision.box(pb.x, pb.y, 6, 16, 1);
      for (var e = 0; e < wave.enemies.length; e++) {
        var en = wave.enemies[e];
        if (!en.alive) continue;
        var ebox = window.Collision.box(en.x, en.y, en.w, en.h, 0.65);
        if (window.Collision.overlap(pbox, ebox)) {
          pb.active = false; en.alive = false;
          score += wave.meta.score;
          if (score > hi) hi = score;
          spawnExplosion(en.x, en.y, wave.meta.color, 14, false);
          if (window.SFX) window.SFX.explosion(false);
          break;
        }
      }
    }

    // onda completa destruída -> bônus energia
    if (window.EnemySys.aliveCount(wave) === 0) {
      energy = Math.min(100, energy + ENERGY_WAVE_BONUS);
      score += 500 * level;
      state = 'levelclear'; msgTimer = 2.0;
      if (window.SFX) window.SFX.levelClear();
      syncHUD();
      return;
    }

    // balas inimigas x player
    if (player.invincible <= 0) {
      var hurt = false;
      for (var k = 0; k < wave.bullets.length; k++) {
        var eb = wave.bullets[k];
        if (!eb.active) continue;
        var ab = window.Collision.box(eb.x, eb.y, eb.w, eb.h, 0.8);
        var pl = window.Collision.box(player.x, player.y, player.w, player.h, 0.65);
        if (window.Collision.overlap(ab, pl)) { eb.active = false; hurt = true; break; }
      }
      // contato direto destrói a nave
      if (!hurt) {
        var plb = window.Collision.box(player.x, player.y, player.w, player.h, 0.65);
        for (var m = 0; m < wave.enemies.length; m++) {
          var en2 = wave.enemies[m];
          if (!en2.alive) continue;
          var eb2 = window.Collision.box(en2.x, en2.y, en2.w, en2.h, 0.7);
          if (window.Collision.overlap(plb, eb2)) { hurt = true; break; }
        }
      }
      if (hurt && player.alive) killPlayer(false);
    }

    updateParticles(dt);
    syncHUD();
  }

  function updateParticles(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.t += dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.98; p.vy *= 0.98;
      if (p.t >= p.life) particles.splice(i, 1);
    }
  }

  // ---- render ----
  function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // linha do topo (score espelhado no canvas é opcional; HUD DOM já mostra)
    if (state === 'playing' || state === 'levelclear') {
      window.EnemySys.draw(ctx, wave);
      window.PlayerSys.draw(ctx, player, time);
      // balas player: amarelas rápidas
      ctx.fillStyle = '#FFFF00';
      for (var i = 0; i < player.bullets.length; i++) {
        var b = player.bullets[i];
        if (!b.active) continue;
        ctx.fillRect(Math.round(b.x - 2), Math.round(b.y - 7), 4, 14);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(Math.round(b.x - 1), Math.round(b.y - 7), 2, 6);
        ctx.fillStyle = '#FFFF00';
      }
    }

    // partículas
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // mira/base inferior
    ctx.fillStyle = '#111';
    ctx.fillRect(0, H - 24, W, 2);

    if (state === 'levelclear') {
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FASE ' + level + ' LIMPA!', W / 2, H / 2 - 10);
      ctx.fillStyle = '#FFFF00';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(wave.meta.name + ' DESTRUÍDO +500x' + level, W / 2, H / 2 + 18);
    }
  }

  // ---- loop principal ----
  var last = performance.now();
  function frame(now) {
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05; // clamp pausa de aba
    if (state === 'levelclear') {
      msgTimer -= dt;
      time += dt;
      updateParticles(dt);
      if (msgTimer <= 0) { nextLevel(); state = 'playing'; }
    } else {
      update(dt);
    }
    render();
    requestAnimationFrame(frame);
  }

  syncHUD();
  showOverlay('MEGA★MANIA', wave.meta.name + ' DO ESPAÇO ATACAM', '← → / A D mover | ESPAÇO atirar (auto-fire ligado)<br>Mobile: arraste ou ◀ ▶ + FIRE<br><br>Limpe a onda para recarregar energia.');
  requestAnimationFrame(frame);
})();
