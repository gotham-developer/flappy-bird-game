let move_speed = 2.5;
let gravity = 0.4;

let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');

let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

let bird_props = bird.getBoundingClientRect();
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

let bird_dy = 0;
let game_state = 'Start';
let warningIsActive = false;

img.style.display = 'none';
message.classList.add('messageStyle');

/* ----------------------------------------------------------
   SCREEN-SIZE WARNING POPUP BLOCKER
---------------------------------------------------------- */
window.addEventListener('load', () => {
  const warn = document.getElementById('screen-warning');
  const closeBtn = document.getElementById('close-warning');

  // Show warning on all devices smaller than desktop monitor size
  if (window.innerWidth < 1280) {
    warn.style.display = 'flex';
    warningIsActive = true; // Lock gameplay
  }

  closeBtn.addEventListener('click', () => {
    warn.style.display = 'none';
    warningIsActive = false; // Allow gameplay
  });
});

/* ----------------------------------------------------------
   START / RESTART TRIGGERS
---------------------------------------------------------- */
function handleStartOrRestart() {
  if (warningIsActive) return;

  if (game_state === 'Start') {
    startGame();
  } else if (game_state === 'End') {
    window.location.reload();
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleStartOrRestart();
  }
});

window.addEventListener('mousedown', () => handleStartOrRestart());
window.addEventListener('touchstart', () => handleStartOrRestart());

/* ----------------------------------------------------------
   GLOBAL JUMP CONTROLS
---------------------------------------------------------- */
window.addEventListener('keydown', (e) => {
  if (game_state === 'Play' && (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter')) {
    img.src = 'images/Bird-2.png';
    bird_dy = -8.2;
  }
});

window.addEventListener('keyup', (e) => {
  if (game_state === 'Play' && (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter')) {
    img.src = 'images/Bird.png';
  }
});

window.addEventListener('mousedown', () => {
  if (game_state === 'Play') {
    img.src = 'images/Bird-2.png';
    bird_dy = -8.2;
  }
});

window.addEventListener('mouseup', () => {
  if (game_state === 'Play') {
    img.src = 'images/Bird.png';
  }
});

/* ----------------------------------------------------------
   START GAME
---------------------------------------------------------- */
function startGame() {
  document.querySelectorAll('.pipe_sprite').forEach((e) => e.remove());

  bird_dy = 0;
  img.style.display = 'block';
  bird.style.top = '40vh';

  game_state = 'Play';
  message.innerHTML = '';
  message.classList.remove('messageStyle');

  score_title.innerHTML = 'Score : ';
  score_val.innerHTML = '0';

  play();
}

/* ----------------------------------------------------------
   MAIN GAME ENGINE
---------------------------------------------------------- */
function play() {
  /* ---------------------- MOVE PIPES ---------------------- */
  function movePipes() {
    if (game_state !== 'Play') return;

    let pipes = document.querySelectorAll('.pipe_sprite');

    pipes.forEach((pipe) => {
      let pipe_props = pipe.getBoundingClientRect();
      bird_props = bird.getBoundingClientRect();

      if (pipe_props.right <= 0) {
        pipe.remove();
        return;
      }

      // Collision detection
      if (
        bird_props.left < pipe_props.left + pipe_props.width &&
        bird_props.left + bird_props.width > pipe_props.left &&
        bird_props.top < pipe_props.top + pipe_props.height &&
        bird_props.top + bird_props.height > pipe_props.top
      ) {
        gameOver();
        return;
      }

      // Scoring
      if (
        pipe_props.right < bird_props.left &&
        pipe_props.right + move_speed >= bird_props.left &&
        pipe.increase_score === '1'
      ) {
        score_val.innerHTML = +score_val.innerHTML + 1;
        pipe.increase_score = '0';
        sound_point.play();
      }

      pipe.style.left = pipe_props.left - move_speed + 'px';
    });

    requestAnimationFrame(movePipes);
  }
  requestAnimationFrame(movePipes);

  /* ---------------------- GRAVITY ---------------------- */
  function applyGravity() {
    if (game_state !== 'Play') return;

    bird_dy += gravity;

    if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
      gameOver();
      return;
    }

    bird.style.top = bird_props.top + bird_dy + 'px';
    bird_props = bird.getBoundingClientRect();

    requestAnimationFrame(applyGravity);
  }
  requestAnimationFrame(applyGravity);

  /* ---------------------- PIPE GENERATION ---------------------- */
  let pipe_gap = 45;
  let pipe_separation = 0;
  const PIPE_THRESHOLD = 160;

  function createPipe() {
    if (game_state !== 'Play') return;

    if (pipe_separation > PIPE_THRESHOLD) {
      pipe_separation = 0;

      let pipe_pos = Math.floor(Math.random() * 43) + 8;

      let top_pipe = document.createElement('div');
      top_pipe.className = 'pipe_sprite';
      top_pipe.style.top = pipe_pos - 70 + 'vh';
      top_pipe.style.left = '100vw';
      document.body.appendChild(top_pipe);

      let bottom_pipe = document.createElement('div');
      bottom_pipe.className = 'pipe_sprite';
      bottom_pipe.style.top = pipe_pos + pipe_gap + 'vh';
      bottom_pipe.style.left = '100vw';
      bottom_pipe.increase_score = '1';
      document.body.appendChild(bottom_pipe);
    }

    pipe_separation++;
    requestAnimationFrame(createPipe);
  }
  requestAnimationFrame(createPipe);
}

/* ----------------------------------------------------------
   GAME OVER
---------------------------------------------------------- */
function gameOver() {
  if (game_state !== 'Play') return;

  game_state = 'End';

  message.innerHTML = 'Game Over'.fontcolor('red') + '<br>Press SPACE, ENTER or CLICK to Restart';

  message.classList.add('messageStyle');
  img.style.display = 'none';

  sound_die.play();
}
