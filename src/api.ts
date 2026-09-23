export const API = import.meta.env.VITE_API_BASE_URL || ''

export type RequestState = {
  request_id: string; product_name: string; status: string; quoted_amount_minor?: number;
  currency: string; quote_expires_at?: string; paid_at?: string; delivery_due_at?: string;
  publish_on_balancebey?: boolean; viewer_url?: string; checkout_url?: string;
}

export async function publicFetch(path: string, token?: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API}${path}`, {...init, headers})
  if (!response.ok) throw new Error((await response.json().catch(()=>null))?.detail || 'İşlem tamamlanamadı')
  return response.json()
}

function hex(buffer: ArrayBuffer) { return [...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('') }
export async function signedFetch(path: string, keyId: string, secret: string, init: RequestInit = {}) {
  const response=await signedRequest(path,keyId,secret,init)
  if(!response.ok) throw new Error((await response.json().catch(()=>null))?.detail||'Yönetim işlemi başarısız')
  return response.json()
}

export async function signedRequest(path: string, keyId: string, secret: string, init: RequestInit = {}) {
  const method=(init.method||'GET').toUpperCase()
  let bytes=new Uint8Array()
  if(typeof init.body==='string') bytes=new TextEncoder().encode(init.body)
  else if(init.body instanceof Blob) bytes=new Uint8Array(await init.body.arrayBuffer())
  else if(init.body instanceof ArrayBuffer) bytes=new Uint8Array(init.body)
  const bodyHash=hex(await crypto.subtle.digest('SHA-256',bytes))
  const timestamp=Math.floor(Date.now()/1000).toString(), nonce=crypto.randomUUID().replaceAll('-','')
  const canonical=[keyId,timestamp,nonce,method,path,bodyHash].join('\n')
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign'])
  const signature=hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(canonical)))
  const headers=new Headers(init.headers); headers.set('X-BB-Key-Id',keyId); headers.set('X-BB-Timestamp',timestamp)
  headers.set('X-BB-Nonce',nonce); headers.set('X-BB-Content-SHA256',bodyHash); headers.set('X-BB-Signature',signature)
  if(typeof init.body==='string'&&init.body) headers.set('Content-Type','application/json')
  return fetch(`${API}${path}`,{...init,headers})
}

export function multipartBody(files:Record<string,File>){
  const boundary=`----bb3d${crypto.randomUUID().replaceAll('-','')}`,parts:BlobPart[]=[]
  for(const [name,file] of Object.entries(files)) parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${file.name.replaceAll('"','')}"\r\nContent-Type: ${file.type||'application/octet-stream'}\r\n\r\n`,file,'\r\n')
  parts.push(`--${boundary}--\r\n`)
  return {body:new Blob(parts),contentType:`multipart/form-data; boundary=${boundary}`}
}
