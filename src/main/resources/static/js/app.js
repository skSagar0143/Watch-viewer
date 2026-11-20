(() => {
  const $ = id => document.getElementById(id);
  const platform = $('platform');
  const urlInput = $('videoUrl');
  const countInput = $('screenCount');
  const loopInput = $('loopMode');
  const muteInput = $('muteMode');
  const grid = $('playerGrid');
  const message = $('message');
  const panels = [];
  let currentSource = null;
  let activeVideos = [];
  const programmaticSeeks = new WeakSet();

  const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be', 'youtube-nocookie.com']);
  const facebookHosts = new Set(['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch', 'www.fb.watch', 'web.facebook.com']);

  function parseVideo(raw, selected) {
    let url;
    try { url = new URL(raw.trim()); } catch (_) { throw new Error('Enter a valid video URL first.'); }
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS links are supported.');
    const host = url.hostname.toLowerCase();
    if (selected === 'youtube') {
      if (!youtubeHosts.has(host)) throw new Error('The URL does not match YouTube. Select the correct platform.');
      let id = '';
      if (host.includes('youtu.be')) id = url.pathname.split('/').filter(Boolean)[0] || '';
      else if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
      else {
        const parts = url.pathname.split('/').filter(Boolean);
        if (['shorts', 'embed', 'live'].includes(parts[0])) id = parts[1] || '';
      }
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('Could not extract a valid YouTube video ID.');
      return { platform: 'youtube', id, url: 'https://www.youtube.com/watch?v=' + id };
    }
    if (selected === 'facebook') {
      if (!facebookHosts.has(host)) throw new Error('The URL does not match Facebook. Select the correct platform.');
      if (!/\/(videos|watch|reel|reels|share\/v|share\/r)/i.test(url.pathname) && !host.includes('fb.watch')) {
        throw new Error('Use a Facebook video, Watch, Reel, or fb.watch URL.');
      }
      return { platform: 'facebook', url: url.href };
    }
    if (selected === 'mp4') {
      const ext = url.pathname.toLowerCase().match(/\.(mp4|webm|ogg)$/);
      if (!ext) throw new Error('For multi-screen playback, use a direct .mp4, .webm, or .ogg video-file URL that you own or are authorized to test.');
      return { platform: 'mp4', url: url.href, format: ext[1] };
    }
    throw new Error('Choose YouTube, Facebook, or an authorized video file.');
  }

  function embedUrl(source) {
    if (source.platform === 'youtube') {
      return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(source.id) +
        '?controls=1&autoplay=0&mute=1&playsinline=1&rel=0';
    }
    return 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(source.url) +
      '&show_text=false&autoplay=false&width=640';
  }

  function showMessage(text, error = false) {
    message.textContent = text;
    message.className = 'message visible' + (error ? ' error' : ' success');
  }

  function stopPlayers() {
    activeVideos.forEach(video => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
    activeVideos = [];
  }

  function updateMetrics(elapsed = null) {
    $('requestedMetric').textContent = currentSource ? countInput.value : '—';
    $('generatedMetric').textContent = panels.length ? panels.length : '—';
    $('generatedDetail').textContent = panels.length
      ? (currentSource && currentSource.platform === 'mp4' ? 'Real video players created' : 'Simulated panels created')
      : 'Waiting for test';
    $('timeMetric').textContent = elapsed === null ? '—' : elapsed.toFixed(1) + ' ms';
    const memory = performance && performance.memory ? performance.memory.usedJSHeapSize / (1024 * 1024) : null;
    $('memoryMetric').textContent = memory === null ? 'N/A' : memory.toFixed(1) + ' MB';
    $('panelCount').textContent = panels.length + ' PANELS';
    $('clearPanels').disabled = panels.length === 0;
    $('multiControls').hidden = !(currentSource && currentSource.platform === 'mp4' && activeVideos.length);
  }

  function makePanel(index) {
    const card = document.createElement('article');
    card.className = 'test-card';
    const top = document.createElement('div');
    top.className = 'test-card-top';
    const number = document.createElement('strong');
    number.textContent = 'SCREEN ' + String(index + 1).padStart(3, '0');
    const status = document.createElement('span');
    status.className = currentSource.platform === 'mp4' ? 'player-status' : 'sim-status';
    status.textContent = currentSource.platform === 'mp4' ? 'LOADING' : 'SIMULATED';
    top.append(number, status);

    const visual = document.createElement('div');
    visual.className = currentSource.platform === 'mp4' ? 'real-video-visual' : 'sim-visual';
    if (currentSource.platform === 'mp4') {
      const video = document.createElement('video');
      video.src = currentSource.url;
      video.controls = true;
      video.autoplay = true;
      video.muted = muteInput.value === 'true';
      video.defaultMuted = video.muted;
      video.loop = loopInput.value === 'true';
      video.playsInline = true;
      video.preload = 'metadata';
      video.addEventListener('playing', () => { status.textContent = 'PLAYING'; status.className = 'player-status playing'; });
      video.addEventListener('seeked', () => {
        if (programmaticSeeks.has(video)) {
          programmaticSeeks.delete(video);
          return;
        }
        if (activeVideos.length < 2 || !Number.isFinite(video.currentTime)) return;
        activeVideos.forEach(other => {
          if (other !== video) {
            try {
              programmaticSeeks.add(other);
              other.currentTime = video.currentTime;
            } catch (_) {
              programmaticSeeks.delete(other);
            }
          }
        });
      });
      video.addEventListener('waiting', () => { status.textContent = 'BUFFERING'; status.className = 'player-status'; });
      video.addEventListener('error', () => { status.textContent = 'LOAD ERROR'; status.className = 'player-status failed'; });
      visual.append(video);
      activeVideos.push(video);
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => { status.textContent = 'CLICK TO PLAY'; status.className = 'player-status'; });
      }
    } else {
      if (currentSource.platform === 'youtube') {
        const thumbnail = document.createElement('img');
        thumbnail.className = 'sim-thumbnail';
        thumbnail.alt = 'YouTube video thumbnail';
        thumbnail.loading = 'lazy';
        thumbnail.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(currentSource.id) + '/hqdefault.jpg';
        thumbnail.onerror = () => {
          if (!thumbnail.dataset.fallbackTried) {
            thumbnail.dataset.fallbackTried = 'true';
            thumbnail.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(currentSource.id) + '/0.jpg';
          } else {
            thumbnail.hidden = true;
          }
        };
        visual.append(thumbnail);
      }
      const overlay = document.createElement('div');
      overlay.className = 'sim-overlay';
      const play = document.createElement('span');
      play.className = 'sim-play';
      play.textContent = '▶';
      const label = document.createElement('span');
      label.className = 'sim-label';
      label.textContent = currentSource.platform.toUpperCase() + (currentSource.id ? ' · ' + currentSource.id : ' · VIDEO PANEL');
      overlay.append(play, label);
      visual.append(overlay);
    }

    const details = document.createElement('div');
    details.className = 'test-card-details';
    const loop = document.createElement('span');
    loop.textContent = 'Loop: ' + (loopInput.value === 'true' ? 'On' : 'Off');
    const mute = document.createElement('span');
    mute.textContent = 'Mute: ' + (muteInput.value === 'true' ? 'On' : 'Off');
    details.append(loop, mute);
    card.append(top, visual, details);
    return card;
  }

  function renderPanels() {
    grid.replaceChildren();
    grid.classList.toggle('empty-grid', panels.length === 0);
    grid.classList.toggle('comfortable', $('density').value === 'comfortable');
    if (!panels.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-workspace';
      const icon = document.createElement('div');
      icon.className = 'empty-symbol';
      icon.textContent = '▦';
      const title = document.createElement('h4');
      title.textContent = 'No test panels generated';
      const copy = document.createElement('p');
      copy.textContent = 'Choose an authorized video file for real multi-screen playback, or a platform link for a simulated layout.';
      empty.append(icon, title, copy);
      grid.append(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    panels.forEach((_, index) => fragment.append(makePanel(index)));
    grid.append(fragment);
  }

  function setPreview(source) {
    if (source.platform === 'mp4') {
      $('previewWrap').hidden = true;
      $('previewEmpty').hidden = false;
      $('previewEmpty').textContent = 'Real video playback is running in the generated panels above. Each panel uses the same authorized video file URL.';
      $('videoPreview').src = 'about:blank';
      return;
    }
    $('previewEmpty').hidden = true;
    $('previewWrap').hidden = false;
    $('videoPreview').src = embedUrl(source);
  }

  $('loadPlay').addEventListener('click', () => {
    try {
      const source = parseVideo(urlInput.value, platform.value);
      const requested = Number(countInput.value);
      if (![1, 10, 50, 100, 200].includes(requested)) throw new Error('Choose a supported panel count.');
      stopPlayers();
      currentSource = source;
      panels.length = 0;
      const start = performance.now();
      for (let i = 0; i < requested; i++) panels.push(i);
      renderPanels();
      const elapsed = performance.now() - start;
      setPreview(source);
      updateMetrics(elapsed);
      if (source.platform === 'mp4') {
        $('syncStatus').textContent = requested + ' authorized-file players loaded';
        showMessage(requested + ' real video players created using your supplied video file. Use Play all / Pause all / Restart all to control them together. Muted=' +
          (muteInput.value === 'true') + ', loop=' + (loopInput.value === 'true') +
          '. Autoplay may be blocked by browser/device limits; use each player control if needed.');
      } else {
        $('multiControls').hidden = true;
        showMessage(requested + ' simulated panels generated with ' + (source.platform === 'youtube' ? 'YouTube thumbnails' : 'platform placeholders') + '. One manual ' + source.platform +
          ' preview is ready below. Multi-screen third-party playback is not enabled.');
      }
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  $('playAll').addEventListener('click', async () => {
    const results = await Promise.allSettled(activeVideos.map(video => video.play()));
    const blocked = results.filter(result => result.status === 'rejected').length;
    $('syncStatus').textContent = blocked ? blocked + ' player(s) blocked by browser/device policy' : 'Play command sent to all ' + activeVideos.length + ' players';
  });
  $('pauseAll').addEventListener('click', () => {
    activeVideos.forEach(video => video.pause());
    $('syncStatus').textContent = 'All players paused';
  });
  $('restartAll').addEventListener('click', async () => {
    activeVideos.forEach(video => { try { video.currentTime = 0; } catch (_) {} });
    const results = await Promise.allSettled(activeVideos.map(video => video.play()));
    const blocked = results.filter(result => result.status === 'rejected').length;
    $('syncStatus').textContent = blocked ? blocked + ' player(s) blocked by browser/device policy' : 'All players restarted together';
  });

  $('clearPanels').addEventListener('click', () => {
    stopPlayers();
    panels.length = 0;
    currentSource = null;
    renderPanels();
    updateMetrics();
    showMessage('Test panels cleared and video players stopped.');
  });

  $('reset').addEventListener('click', () => {
    stopPlayers();
    panels.length = 0;
    currentSource = null;
    urlInput.value = '';
    countInput.value = '100';
    loopInput.value = 'false';
    muteInput.value = 'true';
    $('videoPreview').src = 'about:blank';
    $('multiControls').hidden = true;
    $('previewWrap').hidden = true;
    $('previewEmpty').hidden = false;
    $('previewEmpty').textContent = 'A single embed preview will appear here after you generate the test panels. Start playback manually using the platform\'s own controls.';
    renderPanels();
    updateMetrics();
    showMessage('Test configuration reset.');
  });

  $('density').addEventListener('change', renderPanels);
  countInput.addEventListener('change', () => {
    if (currentSource) showMessage('Panel count changed. Press Load and Play to regenerate the test grid.');
  });

  renderPanels();
  updateMetrics();
})();