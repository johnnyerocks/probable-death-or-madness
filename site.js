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
    audio.setAttribute('controlsList', 'nodownload');
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

const memberDialog = document.getElementById('member-dialog');
const memberOpen = document.querySelector('.member-open');
memberOpen.addEventListener('click', () => memberDialog.showModal());
document.querySelector('.member-close').addEventListener('click', () => memberDialog.close());
memberDialog.addEventListener('click', event => {
  const box = memberDialog.getBoundingClientRect();
  if (event.target === memberDialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) memberDialog.close();
});
