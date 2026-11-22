(() => {
  const mark = document.querySelector('.masthead-mark');
  const canvas = mark?.querySelector('.masthead-snakes');
  const ink = canvas?.getContext('2d');
  if (!ink) return;

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const snakes = [
    { delay: 0, startX: 42, startY: 15, dx: 1, dy: -.026, reach: 199, length: 78, color: '#d7d4ca' },
    { delay: 320, startX: 28, startY: 25, dx: 1, dy: .021, reach: 166, length: 67, color: '#b2b0a8' },
  ];
  let request = null;
  let started = null;
  let hovering = false;
  let focused = false;

  ink.scale(2, 2);
  ink.lineCap = 'round';

  function drawSnake(snake, elapsed) {
    const age = elapsed - snake.delay;
    if (age < 0) return;

    const progress = (age % 2550) / 2550;
    const nose = snake.reach * progress ** .82;
    const tail = Math.max(0, nose - snake.length);
    const point = (distance) => {
      const wave = Math.sin(distance / 10 - progress * 9) * Math.min(1, distance / 20) * 7;
      return [snake.startX + distance * snake.dx - wave * snake.dy,
        snake.startY + distance * snake.dy + wave * snake.dx];
    };

    ink.globalAlpha = Math.min(1, progress * 12, (1 - progress) * 4);
    ink.strokeStyle = snake.color;
    for (let distance = tail; distance < nose; distance += 1.5) {
      const taper = Math.min(1, (distance - tail) / 24);
      ink.lineWidth = 1 + taper * 5.2;
      ink.beginPath();
      ink.moveTo(...point(distance));
      ink.lineTo(...point(Math.min(distance + 2, nose)));
      ink.stroke();
    }

    ink.strokeStyle = '#252421';
    ink.lineWidth = 1.1;
    for (let distance = tail + 22; distance < nose - 7; distance += 6) {
      const [x, y] = point(distance);
      const [nextX, nextY] = point(distance + 1);
      const angle = Math.atan2(nextY - y, nextX - x);
      ink.beginPath();
      ink.moveTo(x - 2.1 * Math.sin(angle), y + 2.1 * Math.cos(angle));
      ink.lineTo(nextX + 2.1 * Math.sin(angle), nextY - 2.1 * Math.cos(angle));
      ink.stroke();
    }

    const [x, y] = point(nose);
    const [previousX, previousY] = point(nose - 2);
    ink.save();
    ink.translate(x, y);
    ink.rotate(Math.atan2(y - previousY, x - previousX));
    if (progress > .24 && progress < .81 && age % 530 < 218) {
      ink.strokeStyle = snake.color;
      ink.lineWidth = 1;
      ink.beginPath();
      ink.moveTo(6, 0);
      ink.lineTo(12, 0);
      ink.lineTo(15, -1.8);
      ink.moveTo(12, 0);
      ink.lineTo(15, 1.8);
      ink.stroke();
    }
    ink.fillStyle = snake.color;
    ink.beginPath();
    ink.moveTo(-5, -2.5);
    ink.quadraticCurveTo(-2, -3.2, 0, -5);
    ink.lineTo(6, -2.5);
    ink.quadraticCurveTo(10, 0, 6, 2.5);
    ink.lineTo(0, 5);
    ink.quadraticCurveTo(-2, 3.2, -5, 2.5);
    ink.fill();
    ink.fillStyle = '#1c1b19';
    ink.fillRect(2, -3, 1.7, 1.5);
    ink.fillRect(2, 1.5, 1.7, 1.5);
    ink.restore();
  }

  function drawFrame(now) {
    started ??= now;
    ink.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
    for (const snake of snakes) drawSnake(snake, now - started);
    request = requestAnimationFrame(drawFrame);
  }

  function updateAnimation() {
    if (motion.matches && (hovering || focused)) {
      request ??= requestAnimationFrame(drawFrame);
      return;
    }
    if (request === null) return;
    cancelAnimationFrame(request);
    request = null;
    started = null;
    ink.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
  }

  mark.addEventListener('pointerenter', (event) => {
    hovering = event.pointerType !== 'touch';
    updateAnimation();
  });
  mark.addEventListener('pointerleave', () => {
    hovering = false;
    updateAnimation();
  });
  mark.addEventListener('focus', () => {
    focused = mark.matches(':focus-visible');
    updateAnimation();
  });
  mark.addEventListener('blur', () => {
    focused = false;
    updateAnimation();
  });
  motion.addEventListener('change', updateAnimation);
})();
