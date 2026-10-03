/* collision.js — AABB preciso estilo arcade com hitbox reduzida */
(function () {
  // hitbox shrink: usa 65% do sprite para feel justo
  function box(x, y, w, h, shrink) {
    shrink = (shrink == null) ? 0.65 : shrink;
    var sw = w * shrink, sh = h * shrink;
    return { x: x - sw / 2, y: y - sh / 2, w: sw, h: sh };
  }
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }
  window.Collision = { box: box, overlap: overlap };
})();
