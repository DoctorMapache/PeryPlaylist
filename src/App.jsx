import { useEffect, useRef, useState } from 'react'
import './App.css'

const SHOW = { name: 'Peryssea', detail: 'Setlist · Show en vivo', count: '9 canciones' }
const COVER = { peryssea: `${import.meta.env.BASE_URL}covers/peryssea.jpg`, kingCrimson: `${import.meta.env.BASE_URL}covers/king-crimson.jpg`, candelabro: `${import.meta.env.BASE_URL}covers/candelabro.jpg` }
const TRACKS = [
  { title: '21st Century Schizoid Man', artist: 'King Crimson', cover: COVER.kingCrimson, file: '01 - 21st Century Schizoid Man - King Crimson.mp3' },
  { title: 'Fragmentos de un Hogar, pt 2', artist: 'Peryssea', cover: COVER.peryssea, file: '02 - Fragmentos de un Hogar, pt 2 - Peryssea.wav' },
  { title: 'Mondongo con Sancocho', artist: 'Peryssea', cover: COVER.peryssea, file: '03 - Mondongo con Sancocho - Peryssea.wav' },
  { title: 'El Último Suspiro', artist: 'Peryssea', cover: COVER.peryssea, file: '04 - El Último Suspiro - Peryssea.mp3' },
  { title: 'El Alegre Baile de los Infelices x Fracaso', artist: 'Candelabro · Peryssea', cover: COVER.peryssea, file: '05 - El Alegre Baile de los Infelices x Fracaso - Candelabro - Peryssea.mp3' },
  { title: 'Pecado', artist: 'Candelabro · Peryssea', cover: COVER.candelabro, file: '06 - Pecado - Candelabro - Peryssea.mp3' },
  { title: 'Sandwich La Castellana', artist: 'Peryssea', cover: COVER.peryssea, file: '07 - Sandwich La Castellana - Peryssea.mp3' },
  { title: 'Cucha No Se Preocupe Más', artist: 'Peryssea', cover: COVER.peryssea, file: '08 - Cucha No Se Preocupe Más - Peryssea.mp3' },
  { title: 'Lechona.mp3', artist: 'Peryssea', cover: COVER.peryssea, file: '09 - Lechona.mp3 - Peryssea.mp3' },
]

const BASE = import.meta.env.BASE_URL
const src = (t) => `${BASE}audio/${encodeURIComponent(t.file).replaceAll('%2F', '/').replaceAll('%2C', ',')}`
const fmt = (s) => {
  if (!Number.isFinite(s)) return '–:––'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const paths = {
  play: 'M8 5v14l11-7z', pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  prev: 'M6 6h2v12H6zM20 6v12L9.5 12z', next: 'M16 6h2v12h-2zM4 6l10.5 6L4 18z',
  shuffle: 'M16 4h4v4l-1.5-1.5L13 12l5.5 5.5L20 16v4h-4l1.5-1.5L12 13l-5.5 5.5-1.4-1.4L10.6 11.6 5.1 6.1l1.4-1.4L12 10.2l4.5-4.7z',
  repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z',
  volume: 'M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z',
  mute: 'M3 9v6h4l5 5V4L7 9zm13 .6L17.4 8l2.1 2.1L21.6 8 23 9.4l-2.1 2.1 2.1 2.1-1.4 1.4-2.1-2.1-2.1 2.1-1.4-1.4 2.1-2.1z',
  search: 'M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79l5 5L21 20zm-5 0A4.5 4.5 0 1 1 10.5 5a4.5 4.5 0 0 1 0 9z',
}
const Icon = ({ n, size = 20 }) => <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor"><path d={paths[n]} /></svg>

export default function App() {
  const audioRef = useRef(null)
  const wantPlay = useRef(false)
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [vol, setVol] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('off')
  const [durs, setDurs] = useState({})
  const [missing, setMissing] = useState(false)
  const [query, setQuery] = useState('')
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const track = TRACKS[i]
  const filteredTracks = TRACKS.map((t, k) => ({ ...t, index: k })).filter(({ title, artist }) => `${title} ${artist}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))

  const openMobilePlayer = () => {
    if (mobileExpanded) return
    window.history.pushState({ ...window.history.state, peryPlaylistPlayer: true }, '', window.location.href)
    setMobileExpanded(true)
  }
  const closeMobilePlayer = () => {
    if (window.history.state?.peryPlaylistPlayer) window.history.back()
    setMobileExpanded(false)
  }

  useEffect(() => {
    TRACKS.forEach((t, k) => {
      const a = new Audio()
      a.preload = 'metadata'
      a.src = src(t)
      a.onloadedmetadata = () => setDurs((d) => ({ ...d, [k]: a.duration }))
    })
  }, [])
  useEffect(() => { audioRef.current.volume = vol; audioRef.current.muted = muted }, [vol, muted])
  useEffect(() => {
    if (!mobileExpanded) return undefined
    const onPopState = () => setMobileExpanded(false)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [mobileExpanded])
  useEffect(() => {
    setMissing(false); setTime(0)
    if (wantPlay.current) audioRef.current.play().catch(() => {})
  }, [i])

  const toggle = () => { const a = audioRef.current; if (a.paused) a.play().catch(() => {}); else a.pause() }
  const goTo = (n, play = true) => {
    wantPlay.current = play
    if (n === i) { audioRef.current.currentTime = 0; if (play) audioRef.current.play().catch(() => {}) }
    else setI(n)
  }
  const randomOther = () => TRACKS.length < 2 ? i : (i + 1 + Math.floor(Math.random() * (TRACKS.length - 1))) % TRACKS.length
  const next = (auto = false) => {
    if (auto && repeat === 'one') return goTo(i)
    if (shuffle) return goTo(randomOther())
    if (i + 1 < TRACKS.length) return goTo(i + 1)
    if (repeat === 'all' || !auto) return goTo(0)
    wantPlay.current = false; audioRef.current.pause(); audioRef.current.currentTime = 0
  }
  const prev = () => audioRef.current.currentTime > 3 ? audioRef.current.currentTime = 0 : goTo(shuffle ? randomOther() : (i - 1 + TRACKS.length) % TRACKS.length)
  const seek = (v) => { audioRef.current.currentTime = v; setTime(v) }
  const playAll = () => { if (i === 0) toggle(); else goTo(0) }

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey) return
      if (e.code === 'Space') { e.preventDefault(); toggle() }
      else if (e.code === 'ArrowRight') e.shiftKey ? next() : seek(Math.min(dur, time + 5))
      else if (e.code === 'ArrowLeft') e.shiftKey ? prev() : seek(Math.max(0, time - 5))
      else if (e.key.toLowerCase() === 'm') setMuted((m) => !m)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: SHOW.name })
    navigator.mediaSession.setActionHandler('play', toggle)
    navigator.mediaSession.setActionHandler('pause', toggle)
    navigator.mediaSession.setActionHandler('previoustrack', prev)
    navigator.mediaSession.setActionHandler('nexttrack', () => next())
  })

  const pct = dur ? time / dur * 100 : 0
  return <div className={`app ${mobileExpanded ? 'mobile-expanded' : ''}`}>
    <audio ref={audioRef} src={src(track)} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} onEnded={() => next(true)} onError={() => setMissing(true)} />
    <aside className="sidebar">
      <a className="brand" href="#inicio" aria-label="Peryssea"><span className="brand-mark">P</span><span>pery<span className="brand-light">ssea</span></span></a>
      <div className="side-label">TU ESPACIO</div>
      <button className="side-link selected"><span className="side-icon">♫</span> Tu setlist</button>
      <div className="sidebar-card"><div className="sidebar-art"><span>PS</span></div><div><strong>Show en vivo</strong><small>Playlist local</small></div><span className="live-dot" /></div>
      <div className="sidebar-bottom"><span className="status-dot" /> Audio local listo</div>
    </aside>
    <main className="main-area" id="inicio">
      <header className="topbar"><div className="nav-pills"><span>COLECCIÓN</span><span className="slash">/</span><strong>SETLIST</strong></div><div className="profile"><span className="profile-avatar">P</span><span>Sesión privada</span></div></header>
      <div className="content-scroll">
        <section className="hero">
          <div className="cover-art"><img src={track.cover} alt={`Portada de ${track.artist}`} /></div>
          <div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> PLAYLIST DE SESIÓN</span><p className="playlist-type">Playlist privada</p><h1>{SHOW.name}</h1><p className="hero-description">La música que nos prepara para salir al escenario.</p><div className="hero-meta"><span className="meta-avatar">P</span><strong>Peryssea</strong><span className="meta-separator">·</span><span>{SHOW.count}</span><span className="meta-separator">·</span><span>Solo audio local</span></div></div>
        </section>
        <section className="playlist-panel" aria-label="Lista de canciones">
          <div className="playlist-actions"><button className="play-large" onClick={playAll} aria-label={playing ? 'Pausar playlist' : 'Reproducir playlist'}><Icon n={playing ? 'pause' : 'play'} size={26}/></button><button className="action-chip" onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle}><Icon n="shuffle" size={19}/><span>Aleatorio</span></button><div className="track-count"><span className="pulse-dot"/>{SHOW.count}</div><label className="search-box"><Icon n="search" size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en la lista" aria-label="Buscar canciones"/>{query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda">×</button>}</label></div>
          <div className="table-head"><span>#</span><span>TÍTULO</span><span className="album-heading">ARTISTA</span><span className="duration-head">DURACIÓN</span></div>
          <ol className="list">{filteredTracks.map((t) => <li key={t.file}><button className={`row ${t.index === i ? 'on' : ''}`} onClick={() => t.index === i ? toggle() : goTo(t.index)} aria-current={t.index === i}>
            <span className="num">{t.index === i && playing ? <span className="eq" aria-label="Sonando"><i/><i/><i/></span> : String(t.index + 1).padStart(2, '0')}</span>
            <span className="track-cell"><img className="track-thumb" src={t.cover} alt=""/><span className="track-copy"><strong>{t.title}</strong><small className="mobile-artist">{t.artist}</small></span></span>
            <span className="artist-cell">{t.artist}</span><span className="len">{fmt(durs[t.index])}</span>
          </button></li>)}</ol>
          {filteredTracks.length === 0 && <div className="empty-state">No encontramos canciones con “{query}”.</div>}
          {missing && <p className="warn">No se pudo cargar <code>public/audio/{track.file}</code>. Comprueba que el archivo exista.</p>}
          <div className="list-foot"><span>Setlist de ensayo</span><span>Archivos servidos desde este dispositivo</span></div>
        </section>
      </div>
    </main>
    <footer className="player-bar">
      <button className="now-playing" onClick={openMobilePlayer} aria-label="Abrir reproductor ampliado"><img className="mini-cover" src={track.cover} alt=""/><span className="mini-copy"><strong>{track.title}</strong><span>{track.artist}</span></span><span className={`playing-indicator ${playing ? 'is-playing' : ''}`}><i/><i/><i/></span></button>
      <div className="player-center"><div className="controls"><button className={`ic ${shuffle ? 'active' : ''}`} onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle} aria-label="Aleatorio" title="Aleatorio"><Icon n="shuffle"/></button><button className="ic" onClick={prev} aria-label="Anterior" title="Anterior"><Icon n="prev"/></button><button className="play" onClick={toggle} aria-label={playing ? 'Pausar' : 'Reproducir'} title="Espacio"><Icon n={playing ? 'pause' : 'play'} size={25}/></button><button className="ic" onClick={() => next()} aria-label="Siguiente" title="Siguiente"><Icon n="next"/></button><button className={`ic ${repeat !== 'off' ? 'active' : ''}`} onClick={() => setRepeat((r) => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')} aria-label="Cambiar repetición" title={repeat === 'one' ? 'Repetir canción' : repeat === 'all' ? 'Repetir playlist' : 'Repetición desactivada'}><Icon n="repeat"/>{repeat === 'one' && <b className="one">1</b>}</button></div><div className="seek"><span>{fmt(time)}</span><input type="range" min="0" max={dur || 0} step="0.1" value={time} style={{ '--p': `${pct}%` }} onChange={(e) => seek(Number(e.target.value))} aria-label="Posición de la canción"/><span>{fmt(dur)}</span></div></div>
      <div className="volume-area"><button className="ic" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Activar sonido' : 'Silenciar'} title="M"><Icon n={muted || vol === 0 ? 'mute' : 'volume'}/></button><input type="range" min="0" max="1" step="0.01" value={muted ? 0 : vol} style={{ '--p': `${(muted ? 0 : vol) * 100}%` }} onChange={(e) => { setVol(Number(e.target.value)); setMuted(false) }} aria-label="Volumen"/></div>
    </footer>
    <section className="mobile-player" aria-label="Reproductor ampliado" aria-hidden={!mobileExpanded}>
      <div className="mobile-player-top"><button className="mobile-collapse" onClick={closeMobilePlayer} aria-label="Volver a la playlist"><span>⌄</span></button><div className="mobile-context"><strong>REPRODUCIENDO DE LA PLAYLIST</strong><span>{SHOW.name}</span></div><span className="mobile-top-spacer"/></div>
      <img className="mobile-artwork" src={track.cover} alt={`Portada de ${track.artist}`}/>
      <div className="mobile-track-meta"><div className="mobile-track-title"><strong>{track.title}</strong><span>{track.artist}</span></div><button className="mobile-more" aria-label="Opciones de la canción">•••</button></div>
      <div className="mobile-seek"><input type="range" min="0" max={dur || 0} step="0.1" value={time} style={{ '--p': `${pct}%` }} onChange={(e) => seek(Number(e.target.value))} aria-label="Posición de la canción"/><div><span>{fmt(time)}</span><span>{fmt(dur)}</span></div></div>
      <div className="mobile-controls"><button className={`ic ${shuffle ? 'active' : ''}`} onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle} aria-label="Aleatorio"><Icon n="shuffle" size={20}/></button><button className="ic mobile-skip" onClick={prev} aria-label="Anterior"><Icon n="prev" size={27}/></button><button className="play mobile-play" onClick={toggle} aria-label={playing ? 'Pausar' : 'Reproducir'}><Icon n={playing ? 'pause' : 'play'} size={32}/></button><button className="ic mobile-skip" onClick={() => next()} aria-label="Siguiente"><Icon n="next" size={27}/></button><button className={`ic ${repeat !== 'off' ? 'active' : ''}`} onClick={() => setRepeat((r) => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')} aria-label="Cambiar repetición"><Icon n="repeat" size={19}/>{repeat === 'one' && <b className="one">1</b>}</button></div>
      <div className="mobile-volume"><Icon n={muted || vol === 0 ? 'mute' : 'volume'} size={16}/><input type="range" min="0" max="1" step="0.01" value={muted ? 0 : vol} style={{ '--p': `${(muted ? 0 : vol) * 100}%` }} onChange={(e) => { setVol(Number(e.target.value)); setMuted(false) }} aria-label="Volumen"/><Icon n="volume" size={16}/></div>
      <div className="mobile-player-footer"><span>♫</span><span>{SHOW.detail}</span><span>⋯</span></div>
    </section>
  </div>
}
