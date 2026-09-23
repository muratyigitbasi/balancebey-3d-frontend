import {FormEvent, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {publicFetch} from '../api'

export function Home(){
  const nav=useNavigate(),[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('')
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const form=new FormData(e.currentTarget)
    try{const created=await publicFetch('/public/v1/requests',undefined,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_name:form.get('product_name'),customer_email:form.get('email'),customer_name:form.get('name')||null,customer_phone:form.get('phone')||null,notes:form.get('notes')||null})})
      for(const file of files){const data=new FormData();data.append('file',file);await publicFetch(`/public/v1/requests/${created.request_id}/images`,created.access_token,{method:'POST',body:data})}
      await publicFetch(`/public/v1/requests/${created.request_id}/submit`,created.access_token,{method:'POST'})
      localStorage.setItem(`bb3d:${created.request_id}`,created.access_token);nav(`/request/${created.request_id}`)
    }catch(x){setError(x instanceof Error?x.message:'Bir hata oluştu')}finally{setBusy(false)}}
  return <main><section className="hero"><p className="eyebrow">ÜRÜNÜNÜZÜ DİJİTALE TAŞIYIN</p><h1>Ürününüz için<br/><em>3B ve AR deneyimi.</em></h1><p>Üye olmadan görsellerinizi gönderin. Ekibimiz modeli hazırlasın, size her yerde kullanabileceğiniz bir görüntüleme bağlantısı sağlasın.</p></section><section className="card request"><h2>Yeni model talebi</h2><form onSubmit={submit}><div className="grid"><label>Ürün adı<input required name="product_name" placeholder="Örn. Ahşap berjer"/></label><label>E-posta<input required type="email" name="email" placeholder="siz@firma.com"/></label><label>Adınız<input name="name"/></label><label>Telefon<input name="phone"/></label></div><label>Ürün notları<textarea name="notes" rows={3} placeholder="Ölçüler, malzeme ve özel istekler…"/></label><label className="drop">Ürün görselleri<input required multiple accept="image/png,image/jpeg,image/webp" type="file" onChange={e=>setFiles([...e.target.files||[]])}/><span>{files.length?`${files.length} görsel seçildi`:'Ön, yan, arka ve detay görsellerini seçin'}</span></label>{error&&<p className="error">{error}</p>}<button disabled={busy||!files.length}>{busy?'Gönderiliyor…':'Model talebi oluştur'}</button></form></section></main>}
