import Redis from 'ioredis';

const memory = new Map<string,{count:number;reset:number}>();
let redis: Redis | null = null;
function client(){
  if (!process.env.REDIS_URL) return null;
  if (!redis) redis = new Redis(process.env.REDIS_URL,{maxRetriesPerRequest:1,enableOfflineQueue:false});
  return redis;
}

export async function rateLimit(key:string, limit:number, windowSeconds:number) {
  const now=Date.now(); const c=client();
  if (c) {
    const bucket=`tamp:rl:${key}`;
    try {
      const n=await c.incr(bucket);
      if(n===1) await c.expire(bucket,windowSeconds);
      return {allowed:n<=limit,remaining:Math.max(0,limit-n)};
    } catch {
      redis=null;
    }
  }
  const current=memory.get(key);
  if(!current || current.reset<=now){ memory.set(key,{count:1,reset:now+windowSeconds*1000}); return {allowed:true,remaining:limit-1}; }
  current.count++;
  return {allowed:current.count<=limit,remaining:Math.max(0,limit-current.count)};
}

export function clientIp(request:Request){ return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'; }
