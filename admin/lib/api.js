export const API=process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000/api";
export const assetUrl=p=>p?`${API.replace(/\/api$/,"")}${p}`:"";
export function token(){return typeof window!=="undefined"?localStorage.getItem("shop_token")||"":""}
export async function api(path,opts={}){const headers={...(opts.headers||{}),Authorization:`Bearer ${token()}`};if(opts.body&&!(opts.body instanceof FormData))headers["Content-Type"]="application/json";const r=await fetch(`${API}${path}`,{...opts,headers,cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||"Request failed");return d}
