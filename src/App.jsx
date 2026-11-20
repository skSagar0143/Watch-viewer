import { useMemo, useState } from 'react';

function getYouTubeId(value) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
    if (!['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) return '';
    if (url.pathname === '/watch') return url.searchParams.get('v') || '';
    const parts = url.pathname.split('/').filter(Boolean);
    if (['embed', 'shorts', 'live'].includes(parts[0])) return parts[1] || '';
    return '';
  } catch {
    return '';
  }
}

export default function App() {
  const [url, setUrl] = useState('');
  const [screens, setScreens] = useState('100');
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoId, setVideoId] = useState('');
  const [error, setError] = useState('');

  const count = Number(screens);
  const thumbnail = useMemo(
    () => videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '',
    [videoId]
  );

  function loadPanels(event) {
    event.preventDefault();
    const id = getYouTubeId(url);
    if (!id || !/^[\w-]{11}$/.test(id)) {
      setError('Enter a valid YouTube video URL (youtube.com/watch, youtu.be, Shorts, or live).');
      setVideoId('');
      return;
    }
    setError('');
    setVideoId(id);
  }

  function reset() {
    setUrl('');
    setScreens('100');
    setLoop(false);
    setMuted(true);
    setVideoId('');
    setError('');
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">W</span><span>watch<span className="brand-light">viewer</span><small>YOUTUBE PANEL SIMULATOR</small></span></a>
        <span className="status"><i /> Ready</span>
      </header>

      <section className="hero">
        <div className="eyebrow">VIDEO LAYOUT TESTING</div>
        <h1>One YouTube link.<br /><span>Your selected panel layout.</span></h1>
        <p>Paste a YouTube URL and generate 1–200 thumbnail panels for layout and UI testing.</p>
        <div className="hero-mark" aria-hidden="true">▶</div>
      </section>

      <section className="config card">
        <div className="section-title"><span>01</span><h2>Video configuration</h2></div>
        <form onSubmit={loadPanels}>
          <label htmlFor="youtubeUrl">YouTube video URL</label>
          <input id="youtubeUrl" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required />
          <div className="fields">
            <div><label htmlFor="screens">Screens</label><select id="screens" value={screens} onChange={e => setScreens(e.target.value)}><option value="1">1 screen</option><option value="10">10 screens</option><option value="50">50 screens</option><option value="100">100 screens</option><option value="200">200 screens</option></select></div>
            <label className="toggle"><input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} /><span>Loop setting</span><small>{loop ? 'On' : 'Off'}</small></label>
            <label className="toggle"><input type="checkbox" checked={muted} onChange={e => setMuted(e.target.checked)} /><span>Muted</span><small>{muted ? 'On' : 'Off'}</small></label>
          </div>
          <div className="actions"><button className="primary" type="submit">Generate screens <span>↗</span></button><button className="secondary" type="button" onClick={reset}>Reset</button></div>
          {error && <p className="error" role="alert">{error}</p>}
        </form>
      </section>

      <section className="summary-row">
        <div className="summary card"><span>VIDEO ID</span><strong>{videoId || '—'}</strong></div>
        <div className="summary card"><span>GENERATED PANELS</span><strong>{videoId ? count : '—'}</strong></div>
        <div className="summary card"><span>LOOP CONFIGURATION</span><strong>{videoId ? (loop ? 'On' : 'Off') : '—'}</strong></div>
        <div className="summary card"><span>AUDIO CONFIGURATION</span><strong>{videoId ? (muted ? 'Muted' : 'Unmuted') : '—'}</strong></div>
      </section>

      <section className="card panels-section">
        <div className="section-title panel-heading"><span>02</span><h2>Generated screens</h2><b>{videoId ? `${count} PANELS` : 'WAITING FOR URL'}</b></div>
        {!videoId ? <div className="empty"><div>▦</div><h3>No screens generated</h3><p>Enter a YouTube URL and click Generate screens.</p></div> :
          <div className="panel-grid">{Array.from({ length: count }, (_, index) => (
            <article className="video-card" key={index}>
              <div className="video-card-head"><strong>SCREEN {String(index + 1).padStart(3, '0')}</strong><span>THUMBNAIL</span></div>
              <div className="thumbnail-wrap"><img src={thumbnail} alt={`YouTube video thumbnail, screen ${index + 1}`} loading={index < 10 ? 'eager' : 'lazy'} onError={e => { e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/0.jpg`; }} /><span className="play-decoration">▶</span></div>
              <div className="video-card-foot"><span>{videoId}</span><span>{muted ? 'MUTED' : 'SOUND'}</span></div>
            </article>
          ))}</div>
        }
      </section>

      {videoId && <section className="card preview">
        <div className="section-title"><span>03</span><h2>Single manual preview</h2></div>
        <div className="embed"><iframe title="YouTube manual preview" src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&playsinline=1`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
        <p className="note">The panels above are thumbnail simulations, not video players. This single YouTube embed is manual-play only. Loop and mute are configuration labels for layout testing; they do not start or automate playback across panels.</p>
      </section>}
      <footer>WATCH VIEWER · REACT + VITE · YOUTUBE UI TESTING</footer>
    </main>
  );
}