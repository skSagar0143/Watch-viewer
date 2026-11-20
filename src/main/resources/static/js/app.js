(() => {
    const urlInput = document.getElementById('videoUrl');
    const loadButton = document.getElementById('loadButton');
    const video = document.getElementById('videoPlayer');
    const emptyState = document.getElementById('emptyState');
    const loopToggle = document.getElementById('loopToggle');
    const browserSelect = document.getElementById('browserSelect');
    const message = document.getElementById('validationMessage');
    const log = document.getElementById('eventLog');

    const el = (id) => document.getElementById(id);
    let hasLog = false;

    function addLog(text, isError = false) {
        if (!hasLog) {
            log.innerHTML = '';
            hasLog = true;
        }
        const row = document.createElement('div');
        row.className = 'log-entry' + (isError ? ' error' : '');
        const time = document.createElement('time');
        time.textContent = new Date().toLocaleTimeString();
        const detail = document.createElement('span');
        detail.textContent = text;
        row.append(time, detail);
        log.prepend(row);
    }

    function setCheck(id, state) {
        const node = el(id);
        node.textContent = state;
        node.className = 'check-status' + (state === 'Passed' ? ' pass' : state === 'Failed' ? ' fail' : '');
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '--:--';
        const value = Math.max(0, Math.floor(seconds));
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        const secs = value % 60;
        return hours ? [hours, minutes, secs].map(v => String(v).padStart(2, '0')).join(':')
            : [minutes, secs].map(v => String(v).padStart(2, '0')).join(':');
    }

    async function validateUrl(url) {
        const response = await fetch('/api/videos/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        if (!response.ok) throw new Error('The server could not validate this URL.');
        return response.json();
    }

    loadButton.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        message.className = 'validation-message';
        message.textContent = '';
        if (!url) {
            message.textContent = 'Enter a video file URL first.';
            message.classList.add('error');
            return;
        }

        loadButton.disabled = true;
        loadButton.textContent = 'Validating…';
        try {
            const result = await validateUrl(url);
            if (!result.valid) {
                message.textContent = result.message;
                message.classList.add('error');
                setCheck('urlCheck', 'Failed');
                addLog(result.message, true);
                return;
            }

            const extensionPath = new URL(result.normalizedUrl).pathname.toLowerCase();
            if (!/\.(mp4|webm|ogv|ogg|m4v)$/i.test(extensionPath)) {
                message.textContent = 'URL syntax is valid, but it does not look like a direct video file. Use a direct .mp4, .webm or .ogg URL.';
                message.classList.add('error');
                setCheck('urlCheck', 'Passed');
                addLog('URL validated, but the path does not have a common video-file extension.', true);
                return;
            }

            video.pause();
            video.removeAttribute('src');
            video.load();
            video.src = result.normalizedUrl;
            video.loop = loopToggle.checked;
            video.hidden = false;
            emptyState.hidden = true;
            el('playerBadge').textContent = 'LOADING MEDIA';
            el('playerBadge').classList.remove('ready');
            el('playState').textContent = 'Loading';
            setCheck('urlCheck', 'Passed');
            setCheck('metadataCheck', 'Pending');
            setCheck('playCheck', 'Pending');
            message.textContent = result.message + ' Press play if playback does not start automatically.';
            addLog('URL validated. Loading media in the current browser session.');
            video.load();
            const playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(() => {
                    el('playState').textContent = 'Ready — press play';
                    addLog('Autoplay was blocked by the browser. Press the player play button.', true);
                });
            }
        } catch (error) {
            message.textContent = error.message || 'Unexpected validation error.';
            message.classList.add('error');
            addLog(error.message || 'Validation error', true);
        } finally {
            loadButton.disabled = false;
            loadButton.innerHTML = 'Load &amp; play <span>↗</span>';
        }
    });

    video.addEventListener('loadedmetadata', () => {
        el('duration').textContent = formatTime(video.duration);
        el('playerBadge').textContent = 'MEDIA READY';
        el('playerBadge').classList.add('ready');
        el('playState').textContent = 'Ready';
        setCheck('metadataCheck', 'Passed');
        addLog('Media metadata loaded. Duration: ' + formatTime(video.duration));
    });
    video.addEventListener('playing', () => {
        el('playState').textContent = 'Playing';
        setCheck('playCheck', 'Passed');
        addLog('Playback started.');
    });
    video.addEventListener('pause', () => {
        if (!video.ended && video.currentTime > 0) {
            el('playState').textContent = 'Paused';
            addLog('Playback paused.');
        }
    });
    video.addEventListener('waiting', () => {
        el('playState').textContent = 'Buffering';
        addLog('Buffering…');
    });
    video.addEventListener('ended', () => {
        el('playState').textContent = video.loop ? 'Looping' : 'Ended';
        addLog(video.loop ? 'Playback reached the end; loop mode is enabled.' : 'Playback ended.');
    });
    video.addEventListener('error', () => {
        const mediaError = video.error;
        const details = mediaError ? 'Media error code ' + mediaError.code : 'Unknown media error';
        el('playState').textContent = 'Error';
        el('playerBadge').textContent = 'MEDIA ERROR';
        el('playerBadge').classList.remove('ready');
        setCheck('metadataCheck', 'Failed');
        setCheck('playCheck', 'Failed');
        addLog(details + '. Check the file URL, server permissions, MIME type and CORS settings.', true);
    });
    video.addEventListener('timeupdate', () => {
        el('currentTime').textContent = formatTime(video.currentTime);
        el('duration').textContent = formatTime(video.duration);
    });

    loopToggle.addEventListener('change', () => {
        video.loop = loopToggle.checked;
        el('loopState').textContent = loopToggle.checked ? 'On' : 'Off';
        addLog('Loop mode ' + (loopToggle.checked ? 'enabled' : 'disabled') + '.');
    });

    browserSelect.addEventListener('change', () => {
        const notes = {
            current: 'Playback runs in the browser currently hosting this app.',
            chrome: 'Chrome profile selected. Open this app in Chrome to run the actual test there.',
            edge: 'Edge profile selected. Open this app in Edge to run the actual test there.',
            firefox: 'Firefox profile selected. Open this app in Firefox to run the actual test there.',
            safari: 'Safari profile selected. Open this app in Safari to run the actual test there.'
        };
        el('browserNote').textContent = notes[browserSelect.value];
        addLog('Target profile changed to ' + browserSelect.options[browserSelect.selectedIndex].text + '. This does not launch another browser.');
    });

    el('clearLog').addEventListener('click', () => {
        log.innerHTML = '<div class="log-empty">No events yet. Load a video to begin.</div>';
        hasLog = false;
    });

    el('loopState').textContent = 'Off';
})();
