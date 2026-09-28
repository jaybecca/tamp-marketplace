import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd, PageShell, africaKeywords, pageJsonLd, siteUrl } from '@/components/site';
import { LocalizedBlogArticle } from '@/components/blog-localized';
import { blogPosts, blogPostBySlug } from '@/data/blog';

export function generateStaticParams() { return blogPosts.map(post => ({ slug: post.slug })); }

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const post=blogPostBySlug(slug);
  if(!post) return {title:'Blog | TAMP Marketplace'};
  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...africaKeywords, post.title, 'online shopping Africa', 'buying guide'],
    alternates:{canonical:`/blog/${post.slug}`},
    openGraph:{title:`${post.title} | TAMP Marketplace`,description:post.excerpt,url:`${siteUrl}/blog/${post.slug}`,images:['/og-image.png']}
  };
}

export default async function Article({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const post=blogPostBySlug(slug);
  if(!post) notFound();
  return <PageShell active="blog">
    <LocalizedBlogArticle post={post} />
    <JsonLd data={pageJsonLd('Article',post.title,post.excerpt,`/blog/${post.slug}`)}/>
  </PageShell>;
}
