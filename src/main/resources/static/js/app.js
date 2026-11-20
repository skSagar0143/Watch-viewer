(() => {
    const $ = (id) => document.getElementById(id);
    const urlInput = $('videoUrl');
    const loadButton = $('loadButton');
    const startButton = $('startButton');
    const reloadButton = $('reloadButton');
    const stopButton = $('stopButton');
    const durationSelect = $('durationSelect');
    const playerHost = $('youtubePlayer');
    const emptyState = $('emptyState');
    const message = $('validationMessage');
    const log = $('eventLog');

    let player = null;
    let videoId = null;
    let apiReady = false;
    let sessionDeadline = null;
    let countdownHandle = null;
    let finalState = null;
    let hasLog = false;

    function addLog(text, isError = false) {
        if (!hasLog) { log.innerHTML = ''; hasLog = true; }
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
        const node = $(id);
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

    function parseYouTubeId(raw) {
        try {
            const url = new URL(raw);
            const host = url.hostname.toLowerCase().replace(/^www\./, '');
            if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || null;
            if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
                if (url.pathname === '/watch') return url.searchParams.get('v');
                const parts = url.pathname.split('/').filter(Boolean);
                if (['embed', 'shorts', 'live'].includes(parts[0])) return parts[1] || null;
            }
        } catch (_) { return null; }
        return null;
    }

    function stopCountdown() {
        if (countdownHandle) window.clearInterval(countdownHandle);
        countdownHandle = null;
        sessionDeadline = null;
    }

    function finishTest(reason) {
        finalState = reason;
        stopCountdown();
        if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
        $('playState').textContent = reason;
        $('timeRemaining').textContent = '00:00';
        startButton.disabled = !player;
        stopButton.disabled = true;
        addLog(reason === 'Test complete' ? 'Configured test duration completed; playback paused.' : 'Test stopped by user.');
    }

    function startCountdown() {
        if (sessionDeadline !== null) return;
        const durationMs = Number(durationSelect.value) * 60 * 1000;
        sessionDeadline = Date.now() + durationMs;
        $('timeRemaining').textContent = formatTime(durationMs / 1000);
        startButton.disabled = true;
        stopButton.disabled = false;
        addLog('Timed playback test started for ' + durationSelect.options[durationSelect.selectedIndex].text + '.');
        countdownHandle = window.setInterval(() => {
            const remaining = Math.max(0, Math.ceil((sessionDeadline - Date.now()) / 1000));
            $('timeRemaining').textContent = formatTime(remaining);
            if (remaining <= 0) finishTest('Test complete');
        }, 250);
    }

    function ensureYouTubeApi() {
        if (window.YT && window.YT.Player) {
            apiReady = true;
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof previous === 'function') previous();
                apiReady = true;
                resolve();
            };
            if (!$('youtube-iframe-api')) {
                const script = document.createElement('script');
                script.id = 'youtube-iframe-api';
                script.src = 'https://www.youtube.com/iframe_api';
                script.onerror = () => reject(new Error('Could not load the YouTube player API. Check your internet connection.'));
                document.head.appendChild(script);
            }
        });
    }

    function createPlayer(id) {
        if (player && typeof player.destroy === 'function') player.destroy();
        playerHost.innerHTML = '';
        playerHost.hidden = false;
        emptyState.hidden = true;
        const frame = document.createElement('div');
        frame.id = 'youtube-player-frame';
        playerHost.appendChild(frame);
        player = new YT.Player('youtube-player-frame', {
            width: '100%',
            height: '100%',
            videoId: id,
            playerVars: { playsinline: 1, rel: 0, controls: 1 },
            events: {
                onReady: () => {
                    $('playerBadge').textContent = 'PLAYER READY';
                    $('playerBadge').classList.add('ready');
                    $('playState').textContent = 'Ready';
                    $('duration').textContent = formatTime(player.getDuration());
                    startButton.disabled = false;
                    reloadButton.disabled = false;
                    setCheck('metadataCheck', 'Passed');
                    addLog('YouTube player is ready. Press Start timed test to begin.');
                },
                onStateChange: (event) => {
                    const states = window.YT.PlayerState;
                    if (event.data === states.PLAYING) {
                        finalState = null;
                        $('playState').textContent = 'Playing';
                        setCheck('playCheck', 'Passed');
                        if (sessionDeadline === null) startCountdown();
                    } else if (event.data === states.PAUSED) {
                        $('playState').textContent = finalState || 'Paused';
                    } else if (event.data === states.BUFFERING) {
                        $('playState').textContent = 'Buffering';
                    } else if (event.data === states.ENDED) {
                        $('playState').textContent = 'Video ended';
                        addLog('Video ended before the selected test duration. No automatic replay was started.');
                    } else if (event.data === states.CUED) {
                        $('playState').textContent = 'Ready';
                    }
                },
                onError: (event) => {
                    $('playerBadge').textContent = 'PLAYER ERROR';
                    $('playerBadge').classList.remove('ready');
                    $('playState').textContent = 'Error ' + event.data;
                    setCheck('playCheck', 'Failed');
                    addLog('YouTube player error ' + event.data + '. The video may be unavailable or embedding may be disabled.', true);
                }
            }
        });
    }

    loadButton.addEventListener('click', async () => {
        const raw = urlInput.value.trim();
        message.className = 'validation-message';
        message.textContent = '';
        const parsedId = parseYouTubeId(raw);
        if (!parsedId || !/^[A-Za-z0-9_-]{11}$/.test(parsedId)) {
            message.textContent = 'Enter a valid YouTube watch, youtu.be, Shorts, or live video URL.';
            message.classList.add('error');
            setCheck('urlCheck', 'Failed');
            addLog('Invalid YouTube URL.', true);
            return;
        }

        loadButton.disabled = true;
        loadButton.textContent = 'Loading…';
        try {
            stopCountdown();
            videoId = parsedId;
            setCheck('urlCheck', 'Passed');
            setCheck('metadataCheck', 'Pending');
            setCheck('playCheck', 'Pending');
            $('playerBadge').textContent = 'LOADING PLAYER';
            $('playerBadge').classList.remove('ready');
            $('playState').textContent = 'Loading';
            $('timeRemaining').textContent = '--:--';
            message.textContent = 'Video link recognized. Initializing the embedded YouTube player.';
            await ensureYouTubeApi();
            createPlayer(videoId);
            addLog('YouTube URL recognized. Creating one embedded player in this tab.');
        } catch (error) {
            message.textContent = error.message || 'Unable to initialize the player.';
            message.classList.add('error');
            addLog(error.message || 'Player initialization failed.', true);
        } finally {
            loadButton.disabled = false;
            loadButton.innerHTML = 'Load video <span>↗</span>';
        }
    });

    startButton.addEventListener('click', () => {
        if (!player) return;
        player.playVideo();
        stopButton.disabled = false;
        startButton.disabled = true;
    });

    stopButton.addEventListener('click', () => {
        if (!player) return;
        finishTest('Stopped');
    });

    reloadButton.addEventListener('click', () => {
        if (!videoId) return;
        stopCountdown();
        finalState = null;
        $('timeRemaining').textContent = '--:--';
        $('playState').textContent = 'Reloading player';
        startButton.disabled = true;
        stopButton.disabled = true;
        addLog('Player manually reloaded. Press Start timed test to play again.');
        createPlayer(videoId);
    });

    durationSelect.addEventListener('change', () => {
        $('testDuration').textContent = durationSelect.value === '60' ? '1 hour' : durationSelect.value + ' min';
        addLog('Test duration set to ' + durationSelect.options[durationSelect.selectedIndex].text + '.');
    });

    $('browserSelect').addEventListener('change', () => {
        const notes = {
            current: 'The player runs in the browser currently hosting this app.',
            chrome: 'Chrome profile selected. Open this app in Chrome to run the test there.',
            edge: 'Edge profile selected. Open this app in Edge to run the test there.',
            firefox: 'Firefox profile selected. Open this app in Firefox to run the test there.',
            safari: 'Safari profile selected. Open this app in Safari to run the test there.'
        };
        $('browserNote').textContent = notes[$('browserSelect').value];
        addLog('Compatibility profile changed to ' + $('browserSelect').options[$('browserSelect').selectedIndex].text + '. It does not launch another browser.');
    });

    window.setInterval(() => {
        if (player && typeof player.getCurrentTime === 'function') {
            try {
                $('currentTime').textContent = formatTime(player.getCurrentTime());
                const length = player.getDuration();
                if (length > 0) $('duration').textContent = formatTime(length);
            } catch (_) { /* Player may still be initializing. */ }
        }
    }, 1000);

    $('clearLog').addEventListener('click', () => {
        log.innerHTML = '<div class="log-empty">No events yet. Load a video to begin.</div>';
        hasLog = false;
    });

    $('testDuration').textContent = durationSelect.value + ' min';

    // Load the official YouTube IFrame Player API once and resolve the pending initializer.
    ensureYouTubeApi().catch(error => addLog(error.message, true));
})();