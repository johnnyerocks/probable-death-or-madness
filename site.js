'use strict';
const stopAudio = document.getElementById('stop-audio');
const players = [];
const formatDuration = seconds => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
function updateStopButton() { stopAudio.hidden = !players.some(audio => !audio.paused && !audio.ended); }
stopAudio.addEventListener('click', () => { players.forEach(audio => { audio.pause(); audio.currentTime = 0; }); updateStopButton(); });
const tracklist = document.getElementById('tracklist');
const tracks = Array.isArray(window.BAND_TRACKS) ? window.BAND_TRACKS : [];

// Download controls are a convenience gate; the public streaming files remain public.
let downloadsUnlocked = false;
let requestedDownload = null;
let downloadReturnFocus = null;
const downloadControls = [];
const downloadForm = document.createElement('form');
downloadForm.className = 'download-unlock';
downloadForm.hidden = true;
downloadForm.innerHTML = '<h3>Unlock track downloads</h3><label for="download-password">Download password</label><div class="download-password-row"><input id="download-password" type="password" autocomplete="off" required><button type="submit">Unlock downloads</button><button type="button" class="download-cancel">Cancel</button></div><p class="download-feedback" role="status" aria-live="polite"></p>';
tracklist.before(downloadForm);
const passwordInput = downloadForm.querySelector('input');
const feedback = downloadForm.querySelector('.download-feedback');
function closeDownloadForm() {
  downloadForm.hidden = true;
  passwordInput.value = '';
  feedback.textContent = '';
  requestedDownload = null;
  if (downloadReturnFocus) downloadReturnFocus.focus();
}
downloadForm.querySelector('.download-cancel').addEventListener('click', closeDownloadForm);
downloadForm.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeDownloadForm(); } });
document.getElementById('demos-overlay').addEventListener('close', () => { downloadForm.hidden = true; passwordInput.value = ''; requestedDownload = null; });
downloadForm.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = downloadForm.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(passwordInput.value));
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== '9d330b319fcaaeb0f6acd2cb9072636f72986d0524ef277a96a4b10c6ed48ac4') {
      feedback.textContent = 'Incorrect password. Please try again.';
      passwordInput.setAttribute('aria-invalid', 'true');
      passwordInput.select();
      return;
    }
    downloadsUnlocked = true;
    passwordInput.removeAttribute('aria-invalid');
    passwordInput.value = '';
    const download = requestedDownload;
    downloadControls.forEach(({button, link}) => { button.hidden = true; link.hidden = false; });
    downloadForm.hidden = true;
    if (download) { download.focus(); download.click(); }
    requestedDownload = null;
  } catch (error) {
    feedback.textContent = 'Downloads could not be unlocked. Please refresh and try again.';
  } finally { submit.disabled = false; }
});

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
    const audioRow = document.createElement('div');
    audioRow.className = 'track-audio-row';
    audioRow.append(audio);
    article.append(audioRow);
    const extension = track.src.split('?')[0].split('.').pop().toLowerCase();
    const downloadName = 'PDOM - ' + track.title.replace(/[\/:*?"<>|]/g, '-') + '.' + extension;
    const link = document.createElement('a');
    link.className = 'track-download';
    link.href = track.src;
    link.download = downloadName;
    link.innerHTML = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/></svg>';
    link.title = 'Download ' + track.title;
    link.setAttribute('aria-label', 'Download ' + track.title + ' (' + extension.toUpperCase() + ')');
    link.hidden = !downloadsUnlocked;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'track-download track-download-locked';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/></svg>';
    button.title = 'Download ' + track.title + ' (password required)';
    button.setAttribute('aria-label', 'Unlock download for ' + track.title);
    button.hidden = downloadsUnlocked;
    button.addEventListener('click', () => {
      requestedDownload = link;
      downloadReturnFocus = button;
      downloadForm.hidden = false;
      feedback.textContent = '';
      passwordInput.removeAttribute('aria-invalid');
      passwordInput.focus();
    });
    downloadControls.push({button, link});
    audioRow.append(button, link);
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
