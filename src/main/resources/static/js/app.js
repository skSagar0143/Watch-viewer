(() => {
  const $ = (id) => document.getElementById(id);
  const platform = $('platform');
  const urlInput = $('videoUrl');
  const addButton = $('addVideo');
  const grid = $('playerGrid');
  const gridSize = $('gridSize');
  const message = $('message');
  const sources = [];
  let nextId = 1;

  const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be', 'youtube-nocookie.com']);
  const facebookHosts = new Set(['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch', 'www.fb.watch', 'web.facebook.com']);

  function parseSource(raw, selectedPlatform) {
    let url;
    try { url = new URL(raw.trim()); } catch (_) { throw new Error('Please enter a valid video URL.'); }
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS video links are supported.');
    const host = url.hostname.toLowerCase();
    if (selectedPlatform === 'youtube') {
      if (!youtubeHosts.has(host)) throw new Error('This does not look like a supported YouTube URL. Select YouTube or paste a YouTube link.');
      let id = '';
      if (host.includes('youtu.be')) id = url.pathname.split('/').filter(Boolean)[0] || '';
      else if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
      else {
        const parts = url.pathname.split('/').filter(Boolean);
        if (['shorts', 'embed', 'live'].includes(parts[0])) id = parts[1] || '';
      }
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('Could not find a valid YouTube video ID in that link.');
      return { platform: 'youtube', id, url: 'https://www.youtube.com/watch?v=' + id, title: 'YouTube video' };
    }
    if (selectedPlatform === 'facebook') {
      if (!facebookHosts.has(host)) throw new Error('This does not look like a supported Facebook URL. Select Facebook or paste a Facebook link.');
      if (!/\/(videos|watch|reel|reels|share\/v|share\/r)/i.test(url.pathname) && !host.includes('fb.watch')) {
        throw new Error('Paste a Facebook video, Watch, Reel, or fb.watch link.');
      }
      return { platform: 'facebook', id: url.href, url: url.href, title: 'Facebook video' };
    }
    throw new Error('Choose a supported platform.');
  }

  function showMessage(text, isError = false) {
    message.textContent = text;
    message.className = 'message visible' + (isError ? ' error' : ' success');
  }

  function embedUrl(source) {
    if (source.platform === 'youtube') {
      return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(source.id) +
        '?controls=1&autoplay=0&mute=0&playsinline=1&rel=0&enablejsapi=0';
    }
    return 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(source.url) +
      '&show_text=false&autoplay=false&width=640';
  }

  function render() {
    const max = Number(gridSize.value);
    $('playerCount').textContent = sources.length + ' / ' + max + ' PLAYERS';
    $('clearAll').disabled = sources.length === 0;
    addButton.disabled = sources.length >= max;
    grid.classList.toggle('empty-grid', sources.length === 0);
    grid.style.setProperty('--columns', String(Math.min(max, 2)));
    if (!sources.length) {
      grid.innerHTML = '<div class="empty-workspace"><div class="empty-symbol">▣</div><h4>Your player workspace is empty</h4><p>Add a YouTube or Facebook URL above to create your first preview.</p></div>';
      return;
    }
    grid.innerHTML = '';
    sources.forEach((source, index) => {
      const card = document.createElement('article');
      card.className = 'player-card';
      card.dataset.id = String(source.localId);

      const header = document.createElement('div');
      header.className = 'player-card-head';
      const identity = document.createElement('div');
      identity.className = 'player-identity';
      const platformTag = document.createElement('span');
      platformTag.className = 'platform-tag ' + source.platform;
      platformTag.textContent = source.platform === 'youtube' ? 'YT' : 'f';
      const titleWrap = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = source.title + ' ' + (index + 1);
      const subtitle = document.createElement('small');
      subtitle.textContent = source.platform === 'youtube' ? 'YouTube embed' : 'Facebook embed';
      titleWrap.append(title, subtitle);
      identity.append(platformTag, titleWrap);
      const remove = document.createElement('button');
      remove.className = 'icon-button';
      remove.type = 'button';
      remove.title = 'Remove player';
      remove.setAttribute('aria-label', 'Remove player');
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        const at = sources.findIndex(item => item.localId === source.localId);
        if (at >= 0) sources.splice(at, 1);
        render();
      });
      header.append(identity, remove);

      const frameWrap = document.createElement('div');
      frameWrap.className = 'frame-wrap';
      const loading = document.createElement('div');
      loading.className = 'frame-loading';
      loading.textContent = 'Loading embed…';
      const frame = document.createElement('iframe');
      frame.title = source.platform === 'youtube' ? 'YouTube video player' : 'Facebook video player';
      frame.src = embedUrl(source);
      frame.loading = 'lazy';
      frame.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.addEventListener('load', () => loading.remove(), { once: true });
      frameWrap.append(loading, frame);

      const footer = document.createElement('div');
      footer.className = 'player-card-foot';
      const state = document.createElement('span');
      state.innerHTML = '<i class="status-dot"></i> Embed loaded by browser';
      const open = document.createElement('a');
      open.href = source.url;
      open.target = '_blank';
      open.rel = 'noopener noreferrer';
      open.textContent = 'Open source ↗';
      footer.append(state, open);
      card.append(header, frameWrap, footer);
      grid.append(card);
    });
  }

  addButton.addEventListener('click', () => {
    const raw = urlInput.value.trim();
    if (!raw) { showMessage('Paste a video URL first.', true); return; }
    if (sources.length >= Number(gridSize.value)) {
      showMessage('The selected grid is full. Increase its size or remove a player first.', true);
      return;
    }
    try {
      const source = parseSource(raw, platform.value);
      if (sources.some(item => item.url === source.url)) {
        showMessage('That video is already in this workspace. Add a different video URL.', true);
        return;
      }
      source.localId = nextId++;
      sources.push(source);
      urlInput.value = '';
      showMessage('Video source added. Press Play in the embedded player when you are ready.', false);
      render();
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  urlInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') addButton.click();
  });

  gridSize.addEventListener('change', () => {
    if (sources.length > Number(gridSize.value)) {
      showMessage('You already have ' + sources.length + ' players. Remove ' + (sources.length - Number(gridSize.value)) + ' to fit the selected grid.', true);
    } else {
      showMessage('Grid capacity set to ' + gridSize.value + ' distinct player(s).', false);
    }
    render();
  });

  $('clearAll').addEventListener('click', () => {
    sources.splice(0, sources.length);
    showMessage('Workspace cleared.', false);
    render();
  });

  render();
})();