(() => {
  const videos = [...document.querySelectorAll('video')];
  document.querySelectorAll('.js-only').forEach(el => { el.hidden = false; });
  const revealTask = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target && target.matches('details')) target.open = true;
  };
  window.addEventListener('hashchange', revealTask);
  revealTask();
  videos.forEach(video => video.addEventListener('play', () => videos.forEach(other => {
    if (other !== video) other.pause();
  })));
  document.querySelectorAll('[data-video][data-seconds]').forEach(button => {
    button.addEventListener('click', () => {
      const video = document.getElementById(button.dataset.video);
      const status = button.closest('.chapter-panel').querySelector('.playback-status');
      const seconds = Number(button.dataset.seconds);
      status.textContent = 'Opening chapter…';
      const jump = () => {
        video.currentTime = seconds;
        video.play().then(() => { status.textContent = 'Playing: ' + button.textContent.trim(); })
          .catch(() => { status.textContent = 'Chapter selected. Press Play on the video to watch.'; });
      };
      if (video.readyState >= 1) jump();
      else {
        video.addEventListener('loadedmetadata', jump, {once: true});
        video.addEventListener('error', () => { status.textContent = 'The video could not load. Try the download link or use the written guide below.'; }, {once: true});
        video.load();
      }
      video.scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
  });
})();
