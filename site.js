'use strict';
const stopAudio = document.getElementById('stop-audio');
const players = [];
const formatDuration = seconds => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
function updateStopButton() { stopAudio.hidden = !players.some(audio => !audio.paused && !audio.ended); }
stopAudio.addEventListener('click', () => { players.forEach(audio => { audio.pause(); audio.currentTime = 0; }); updateStopButton(); });
const tracklist = document.getElementById('tracklist');
const tracks = Array.isArray(window.BAND_TRACKS) ? window.BAND_TRACKS : [];
tracks.forEach((track, index) => {
  const article = document.createElement('article');
  article.className = 'track';
  const number = document.createElement('span');
  number.className = 'track-number';
  number.textContent = String(index + 1).padStart(2, '0');
  number.setAttribute('aria-hidden', 'true');
  const copy = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = track.title;
  const description = document.createElement('p');
  description.textContent = track.description;
  copy.append(title);
  if (track.description) copy.append(description);
  const status = document.createElement('span');
  status.className = 'track-status';
  status.textContent = track.src ? 'Demo recording · ' + formatDuration(track.duration) : 'Coming soon';
  article.append(number, copy, status);
  if (track.src) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.setAttribute('controlsList', 'nodownload noplaybackrate');
    audio.preload = 'metadata';
    audio.src = track.src;
    audio.setAttribute('aria-label', 'Play ' + track.title);
    players.push(audio);
    audio.addEventListener('loadedmetadata', () => { if (Number.isFinite(audio.duration)) status.textContent = 'Demo recording · ' + formatDuration(audio.duration); });
    audio.addEventListener('pause', updateStopButton);
    audio.addEventListener('ended', () => {
      const next = players[players.indexOf(audio) + 1];
      if (next) { next.currentTime = 0; next.play().catch(() => { updateStopButton(); }); }
      updateStopButton();
    });
    audio.addEventListener('play', () => {
      document.querySelectorAll('audio').forEach(other => { if (other !== audio) other.pause(); });
      updateStopButton();
    });
    audio.addEventListener('error', () => { status.textContent = 'Audio unavailable'; });
    article.append(audio);
  }
  tracklist.append(article);
});


document.querySelectorAll('[data-overlay]').forEach(button => {
  button.addEventListener('click', () => { const dialog = document.getElementById(button.dataset.overlay + '-overlay'); dialog.append(stopAudio); dialog.showModal(); });
});
document.querySelectorAll('.site-overlay').forEach(dialog => {
  dialog.addEventListener('close', () => document.body.append(stopAudio));
  dialog.querySelector('.overlay-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
});
