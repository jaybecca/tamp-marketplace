'use client';

import { useEffect, useState } from 'react';
import { blogPosts, type BlogPost } from '@/data/blog';
import { blogLocales, type BlogLocale } from '@/data/blog-locales';

type Lang='en'|'fr'|'pt'|'ar'|'sw'|'zu';
const valid:Lang[]=['en','fr','pt','ar','sw','zu'];
const labels:Record<Lang,{read:string;home:string;blog:string;before:string;final:string;notice:string}>= {
 en:{read:'Read article →',home:'Home',blog:'Blog',before:'What to check before you click through',final:'A smarter final check',notice:'This article is general shopping information. Prices, availability, delivery, taxes and merchant terms can change; confirm current details with the merchant before checkout.'},
 fr:{read:'Lire l’article →',home:'Accueil',blog:'Blog',before:'À vérifier avant de cliquer',final:'Une dernière vérification plus intelligente',notice:'Cet article fournit des informations générales sur les achats. Les prix, la disponibilité, la livraison, les taxes et les conditions du marchand peuvent changer ; confirmez les informations actuelles auprès du marchand avant de payer.'},
 pt:{read:'Ler artigo →',home:'Início',blog:'Blog',before:'O que verificar antes de clicar',final:'Uma verificação final mais inteligente',notice:'Este artigo apresenta informações gerais sobre compras. Os preços, a disponibilidade, a entrega, os impostos e as condições da loja podem mudar; confirme os dados atuais com a loja antes do pagamento.'},
 ar:{read:'اقرأ المقال ←',home:'الرئيسية',blog:'المدونة',before:'ما يجب التحقق منه قبل الانتقال',final:'مراجعة نهائية أكثر ذكاءً',notice:'هذه المقالة تقدم معلومات عامة عن التسوق. قد تتغير الأسعار والتوفر والتوصيل والضرائب وشروط التاجر؛ تحقق من التفاصيل الحالية مع التاجر قبل الدفع.'},
 sw:{read:'Soma makala →',home:'Nyumbani',blog:'Blogu',before:'Cha kuangalia kabla ya kubofya',final:'Ukaguzi wa mwisho wenye busara',notice:'Makala haya ni maelezo ya jumla ya ununuzi. Bei, upatikanaji, uwasilishaji, kodi na masharti ya muuzaji yanaweza kubadilika; thibitisha maelezo ya sasa kwa muuzaji kabla ya kulipa.'},
 zu:{read:'Funda isihloko →',home:'Ikhaya',blog:'Ibhulogi',before:'Okumele ukubheke ngaphambi kokuchofoza',final:'Ukuhlola kokugcina okuhlakaniphile',notice:'Lesi sihloko sinikeza ulwazi olujwayelekile lokuthenga. Amanani, ukutholakala, ukulethwa, izintela nemigomo yomthengisi kungashintsha; qinisekisa imininingwane yamanje nomthengisi ngaphambi kokukhokha.'}
};
function getLang():Lang{if(typeof window==='undefined')return'en';const x=localStorage.getItem('tamp-language')||'en';return valid.includes(x as Lang)?x as Lang:'en'}
function useLang(){const[l,setL]=useState<Lang>('en');useEffect(()=>{const f=()=>setL(getLang());f();addEventListener('tamp-language-change',f);addEventListener('storage',f);return()=>{removeEventListener('tamp-language-change',f);removeEventListener('storage',f)}},[]);return l}
function localized(post:BlogPost,lang:Lang):BlogPost{if(lang==='en')return post;const x=blogLocales[lang]?.[post.slug] as BlogLocale|undefined;return x?{...post,...x}:post}
export function LocalizedBlogList(){const lang=useLang();return <div className="listing-grid" dir={lang==='ar'?'rtl':'ltr'}>{blogPosts.map(post=>{const p=localized(post,lang);return <article className="listing-card" key={post.slug}><div className="listing-image">{post.icon}</div><span className="pill">{p.category}</span><h3>{p.title}</h3><p>{p.excerpt}</p><a className="yellow-btn" href={`/blog/${post.slug}`}>{labels[lang].read}</a></article>})}</div>}
export function LocalizedBlogArticle({post}:{post:BlogPost}){const lang=useLang();const translated=localized(post,lang);const l=labels[lang];return <article className="market-page policy" dir={lang==='ar'?'rtl':'ltr'}><div className="crumbs">{l.home} / {l.blog} / {translated.title}</div><div className="eyebrow">{translated.category}</div><h1>{translated.title}</h1><p className="lead">{translated.excerpt}</p>{translated.content.map((paragraph,index)=><div key={index}>{index===1&&<h2>{l.before}</h2>}{index===2&&<h2>{l.final}</h2>}<p>{paragraph}</p></div>)}<div className="site-note">{l.notice}</div></article>}
