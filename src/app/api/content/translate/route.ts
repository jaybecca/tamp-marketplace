import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/server/security-rate-limit';

type Item={slug:string;title:string;category:string;excerpt:string;content?:string[]};
const names={en:'English',fr:'French',pt:'Portuguese',ar:'Arabic',sw:'Kiswahili',zu:'Zulu'} as const;
export async function POST(request:Request){
  try{
    const rl=await rateLimit(`translate:${clientIp(request)}`,20,60);
    if(!rl.allowed) return NextResponse.json({error:'Too many translation requests. Please try again shortly.'},{status:429});
    const key=process.env.GEMINI_API_KEY;
    if(!key) return NextResponse.json({error:'GEMINI_API_KEY is not configured.'},{status:503});
    const body=await request.json(); const lang=String(body.lang||'en') as keyof typeof names; const texts=Array.isArray(body.texts)?body.texts.map((x:unknown)=>String(x).slice(0,500)).filter(Boolean):[]; const items=Array.isArray(body.items)?body.items as Item[]:[];
    if(!names[lang] || (!items.length && !texts.length)) return NextResponse.json({error:'Invalid translation request.'},{status:400});
    if(lang==='en') return NextResponse.json({items,texts});
    if(texts.length){
      const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
      const prompt=`Translate every human-readable string in this JSON array into ${names[lang]}. Preserve product names, merchant names, brand names, numbers, units, symbols and punctuation where appropriate. Return JSON only as {\"texts\":[...]} in the same order.\n${JSON.stringify({texts})}`;
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:0.1}})});
      if(!r.ok) return NextResponse.json({error:'Gemini translation request failed.'},{status:502});
      const data=await r.json(); const text=data?.candidates?.[0]?.content?.parts?.[0]?.text; if(!text) return NextResponse.json({error:'Gemini returned no translation.'},{status:502});
      const parsed=JSON.parse(text); return NextResponse.json({texts:Array.isArray(parsed.texts)?parsed.texts:[]});
    }
    const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
    const prompt=`Translate every human-readable field in this JSON into ${names[lang]}. Preserve slugs, product names, merchant names, numbers, units, emojis, HTML-free formatting, and the exact JSON structure. Do not leave English prose behind. Technical acronyms such as USB-C, SSD, HDD, ANC, GPU and Hz may remain unchanged. Return JSON only with an items array.\n${JSON.stringify({items})}`;
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:0.1}})});
    if(!r.ok) return NextResponse.json({error:'Gemini translation request failed.'},{status:502});
    const data=await r.json(); const text=data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if(!text) return NextResponse.json({error:'Gemini returned no translation.'},{status:502});
    const parsed=JSON.parse(text); return NextResponse.json({items:parsed.items});
  }catch{return NextResponse.json({error:'Translation service unavailable.'},{status:500});}
}
