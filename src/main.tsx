import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Link, Route, Routes} from 'react-router-dom'
import '@google/model-viewer'
import './styles.css'
import {Home} from './pages/Home'
import {Track} from './pages/Track'
import {Viewer} from './pages/Viewer'
import {Admin} from './pages/Admin'

function App(){return <><header><Link to="/" className="brand"><span>BB</span> 3D Studio</Link><nav><Link to="/">Model talebi</Link><Link to="/admin">Yönetim</Link></nav></header><Routes><Route path="/" element={<Home/>}/><Route path="/request/:id" element={<Track/>}/><Route path="/view/:slug" element={<Viewer/>}/><Route path="/admin" element={<Admin/>}/></Routes><footer>BalanceBey 3D Studio · Türkiye</footer></>}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>)
