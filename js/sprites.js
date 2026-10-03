/* sprites.js — Pixel-art 8-bit gerada por código, sem assets externos */
(function () {
  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  // rows: array de strings, palette: {char: color}
  function buildSprite(rows, palette) {
    var h = rows.length, w = rows[0].length;
    var c = makeCanvas(w, h);
    var ctx = c.getContext('2d');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var ch = rows[y][x];
        if (ch === '.' || ch === ' ') continue;
        ctx.fillStyle = palette[ch] || '#FFF';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  var PLAYER_ROWS = [
    ".......WW.......",
    ".......WW.......",
    ".......WW.......",
    "......WWWW......",
    "......WWWW......",
    "......WWWW......",
    ".....WWWWWW.....",
    ".....WWWWWW.....",
    "....WWWWWWWW....",
    "....WWCWWCWW....",
    "....WWWWWWWW....",
    "...WWWWWWWWWW...",
    "...WWRRWWRRWW...",
    "..WWRRWWWWRRWW..",
    "..WWBBBBBBBBWW..",
    "..WBBBBBBBBBBW.."
  ];

  var BURGER_ROWS = [
    ".....OOOOOO.....",
    "...OOOOOOOOOO...",
    "..OOOOOOOOOOOO..",
    "..OOOOOOOOOOOO..",
    "..YYYYYYYYYYYY..",
    ".GGGGGGGGGGGGGG.",
    ".GGGGGGGGGGGGGG.",
    ".RRRRRRRRRRRRRR.",
    ".BBBBBBBBBBBBBB.",
    ".BBBBBBBBBBBBBB.",
    "..OOOOOOOOOOOO..",
    "...OOOOOOOOOO...",
    "................",
    "................"
  ];

  var COOKIE_ROWS = [
    ".....OOOOOO.....",
    "...OOOOOOOOOO...",
    "..OOOOKOOOOOOO..",
    ".OOOOOOOOOOOKOO.",
    ".OOOOOOOOOOOOOO.",
    "OOOOOKOOOOOKOOOO",
    "OOOOOOOOOOOOOOOO",
    "OOOOOOOOKOOOOOOO",
    "OOOOOOOOOOKOOOOO",
    ".OOOOOOOOOOOOKO.",
    ".OOOOKOOOOOOOOO.",
    "..OOOOOOOOOOOO..",
    "...OOOOOOOOOO...",
    ".....OOOOOO.....",
    "................",
    "................"
  ];

  var IRON_ROWS = [
    "......DDDD......",
    ".....DDDDDD.....",
    ".....DDDDDD.....",
    ".....GGGGGGGG...",
    "....GGWWGGGGGG..",
    "....GWWGGGGGGGG.",
    "...GWWGGGGGGGGGG",
    "...GWWGGGGGGGGGG",
    "..GWWGGGGGGGGGGG",
    "..GGGGGGGGGGGGGG",
    "..SSSSSSSSSSSSSS",
    "..SSSSSSSSSSSSSS",
    "...SSSSSSSSSS...",
    "................",
    "................",
    "................"
  ];

  var BOWTIE_ROWS = [
    "RRR........RRR..",
    "RRRR......RRRR..",
    "RRRRR....RRRRR..",
    "RRRRRR..RRRRRR..",
    "RRRRRRRRRRRRRR..",
    ".RRRRRYYYYRRRRR.",
    ".RRRRRYYYYRRRRR.",
    "RRRRRRYYYYRRRRR.",
    "RRRRRR..RRRRRR..",
    "RRRRR....RRRRR..",
    "RRRR......RRRR..",
    "RRR........RRR..",
    "................",
    "................"
  ];

  var DIAMOND_ROWS = [
    "......CCCC......",
    ".....CCCCCC.....",
    "....CCWWCCCC....",
    "...CCWWWCCCCC...",
    "..CCWWCCCCCCC...",
    ".CCWWCCCCCCCCC..",
    "..CCCCCCCCCCC...",
    "...CCCCCCCCC....",
    "....CCCCCCC.....",
    ".....CCCCC......",
    "......CCC.......",
    ".......C........",
    "................",
    "................"
  ];

  var PAL = {
    W: '#FFFFFF',
    C: '#00FFFF',
    R: '#FF2222',
    B: '#3333FF',
    O: '#E49B3F',
    Y: '#FFE135',
    G: '#39FF14',
    K: '#3A2005',
    D: '#222222',
    S: '#888888'
  };
  // ajustes por sprite
  var PAL_BURGER = Object.assign({}, PAL, { O: '#E49B3F', Y: '#FFE135', G: '#39FF14', R: '#FF3131', B: '#7B3F00' });
  var PAL_COOKIE = Object.assign({}, PAL, { O: '#D2A24C', K: '#2A1500' });
  var PAL_IRON = Object.assign({}, PAL, { G: '#C0C0C0', W: '#FFFFFF', D: '#111111', S: '#555555' });
  var PAL_BOW = Object.assign({}, PAL, { R: '#FF00AA', Y: '#FFFF00' });
  var PAL_DIAM = Object.assign({}, PAL, { C: '#00FFFF', W: '#FFFFFF' });

  window.SPRITES = {
    player: buildSprite(PLAYER_ROWS, PAL),
    burger: buildSprite(BURGER_ROWS, PAL_BURGER),
    cookie: buildSprite(COOKIE_ROWS, PAL_COOKIE),
    iron: buildSprite(IRON_ROWS, PAL_IRON),
    bowtie: buildSprite(BOWTIE_ROWS, PAL_BOW),
    diamond: buildSprite(DIAMOND_ROWS, PAL_DIAM)
  };

  // Metadados das ondas: nome, sprite key, cor tiro, pontos
  window.WAVES = [
    { key: 'burger', name: 'HAMBÚRGUER', emoji: '🍔', color: '#FFB347', score: 100 },
    { key: 'cookie', name: 'BOLACHA', emoji: '🍪', color: '#D2A24C', score: 150 },
    { key: 'iron', name: 'FERRO', emoji: '♨', color: '#C0C0C0', score: 200 },
    { key: 'bowtie', name: 'GRAVATA', emoji: '🎀', color: '#FF00AA', score: 250 },
    { key: 'diamond', name: 'DIAMANTE', emoji: '💎', color: '#00FFFF', score: 300 }
  ];

  window.drawSprite = function (ctx, img, x, y, scale) {
    scale = scale || 2;
    ctx.imageSmoothingEnabled = false;
    var w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    return { w: w, h: h };
  };
})();
