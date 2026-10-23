'use strict';
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
  status.textContent = track.src ? 'Demo recording' : 'Coming soon';
  article.append(number, copy, status);
  if (track.src) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.setAttribute('controlsList', 'nodownload noplaybackrate');
    audio.preload = 'none';
    audio.src = track.src;
    audio.setAttribute('aria-label', 'Play ' + track.title);
    audio.addEventListener('play', () => {
      document.querySelectorAll('audio').forEach(other => { if (other !== audio) other.pause(); });
    });
    audio.addEventListener('error', () => { status.textContent = 'Audio unavailable'; });
    article.append(audio);
  }
  tracklist.append(article);
});


document.querySelectorAll('[data-overlay]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.overlay + '-overlay').showModal());
});
document.querySelectorAll('.site-overlay').forEach(dialog => {
  dialog.querySelector('.overlay-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.querySelectorAll('audio').forEach(audio => audio.pause()));
});
