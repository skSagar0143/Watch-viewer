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
    throw new Error('Choose YouTube or Facebook.');
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

  function updateMetrics(elapsed = null) {
    $('requestedMetric').textContent = currentSource ? countInput.value : '—';
    $('generatedMetric').textContent = panels.length ? panels.length : '—';
    $('generatedDetail').textContent = panels.length ? 'Simulated panels created' : 'Waiting for test';
    $('timeMetric').textContent = elapsed === null ? '—' : elapsed.toFixed(1) + ' ms';
    const memory = performance && performance.memory ? performance.memory.usedJSHeapSize / (1024 * 1024) : null;
    $('memoryMetric').textContent = memory === null ? 'N/A' : memory.toFixed(1) + ' MB';
    $('panelCount').textContent = panels.length + ' PANELS';
    $('clearPanels').disabled = panels.length === 0;
  }

  function makePanel(index) {
    const card = document.createElement('article');
    card.className = 'test-card';
    const top = document.createElement('div');
    top.className = 'test-card-top';
    const number = document.createElement('strong');
    number.textContent = 'SCREEN ' + String(index + 1).padStart(3, '0');
    const status = document.createElement('span');
    status.className = 'sim-status';
    status.textContent = 'SIMULATED';
    top.append(number, status);

    const visual = document.createElement('div');
    visual.className = 'sim-visual';
    const play = document.createElement('span');
    play.className = 'sim-play';
    play.textContent = '▶';
    const label = document.createElement('span');
    label.className = 'sim-label';
    label.textContent = currentSource.platform.toUpperCase() + ' · TEST PANEL';
    visual.append(play, label);

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
      copy.textContent = 'Configure a video and press Load and Play to create the selected number of simulated panels.';
      empty.append(icon, title, copy);
      grid.append(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    panels.forEach((_, index) => fragment.append(makePanel(index)));
    grid.append(fragment);
  }

  function setPreview(source) {
    $('previewEmpty').hidden = true;
    $('previewWrap').hidden = false;
    $('videoPreview').src = embedUrl(source);
  }

  $('loadPlay').addEventListener('click', () => {
    try {
      const source = parseVideo(urlInput.value, platform.value);
      const requested = Number(countInput.value);
      if (![1, 10, 50, 100, 200].includes(requested)) throw new Error('Choose a supported panel count.');
      currentSource = source;
      panels.length = 0;
      const start = performance.now();
      for (let i = 0; i < requested; i++) panels.push(i);
      const elapsed = performance.now() - start;
      renderPanels();
      setPreview(source);
      updateMetrics(elapsed);
      showMessage(requested + ' simulated panels generated. One manual ' + source.platform + ' embed preview is ready below. Playback is not started automatically.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  $('clearPanels').addEventListener('click', () => {
    panels.length = 0;
    currentSource = null;
    renderPanels();
    updateMetrics();
    showMessage('Test panels cleared.');
  });

  $('reset').addEventListener('click', () => {
    panels.length = 0;
    currentSource = null;
    urlInput.value = '';
    countInput.value = '100';
    loopInput.value = 'false';
    muteInput.value = 'true';
    $('videoPreview').src = 'about:blank';
    $('previewWrap').hidden = true;
    $('previewEmpty').hidden = false;
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