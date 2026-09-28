'use client';
import { useLang } from '@/components/localization';
import { blogPosts } from '@/data/blog';
import { blogLocales } from '@/data/blog-locales';

export function LocalizedHomeBlog() {
  const lang = useLang();
  return <div className="article-grid">{blogPosts.slice(0,3).map(post => {
    const localized = lang === 'en' ? post : (blogLocales[lang]?.[post.slug] || post);
    return <a className="article-card" href={`/blog/${post.slug}`} key={post.slug}><div className="article-image">{post.icon}</div><div className="article-body"><span>{localized.category}</span><h3>{localized.title}</h3><p>{localized.excerpt}</p><small>{lang === 'fr' ? 'Lire l’article →' : lang === 'pt' ? 'Ler artigo →' : lang === 'ar' ? 'اقرأ المقال ←' : lang === 'sw' ? 'Soma makala →' : lang === 'zu' ? 'Funda isihloko →' : 'Read more →'}</small></div></a>;
  })}</div>;
}
