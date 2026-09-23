import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Link, Route, Routes} from 'react-router-dom'
import '@google/model-viewer'
import './styles.css'
import {Home} from './pages/Home'
import {Track} from './pages/Track'
import {Viewer} from './pages/Viewer'
import {Admin} from './pages/Admin'
import {Models} from './pages/Models'

function App(){return <><header><Link to="/" className="brand"><img src="/brand/balancebey-3d-logo.png" alt=""/><span><strong>BalanceBey</strong><small>3D Studio</small></span></Link><nav><Link to="/modellemeler">Modellemeler</Link><Link to="/">Model talebi</Link><Link to="/admin">Yönetim</Link></nav></header><Routes><Route path="/modellemeler" element={<Models/>}/><Route path="/" element={<Home/>}/><Route path="/request/:id" element={<Track/>}/><Route path="/view/:slug" element={<Viewer/>}/><Route path="/admin" element={<Admin/>}/></Routes><footer><a className="kodbey-signature" href="https://kodbey.com" target="_blank" rel="noreferrer" aria-label="Kodbey Teknoloji web sitesi"><span className="kodbey-lockup"><img className="kodbey-symbol" src="/brand/kodbey-symbol.webp" alt=""/><img className="kodbey-type" src="/brand/kodbey-type.webp" alt="Kodbey"/></span><span>Bu dijital deneyim Kodbey Teknoloji tarafından yapılmıştır.</span></a><div className="footer-contact"><a href="mailto:muratyigitbasi@balancebey.com">muratyigitbasi@balancebey.com</a><a href="tel:+905053676335">+90 505 367 63 35</a><span>Altındağ, Ankara / Türkiye</span></div><div className="footer-links"><a href="https://kodbey.com" target="_blank" rel="noreferrer">kodbey.com</a><span>© {new Date().getFullYear()} Tüm hakları saklıdır.</span></div></footer></>}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>)
