import Redis from 'ioredis';

const memory = new Map<string,{count:number;reset:number}>();
let redis: Redis | null = null;

function client(){
  if (!process.env.REDIS_URL) return null;

  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    redis.on('error', () => {
      // Redis is an optional acceleration layer for rate limiting.
      // The in-memory limiter remains available if Redis is unavailable.
    });
  }

  return redis;
}

async function memoryRateLimit(
  key:string,
  limit:number,
  windowSeconds:number
) {
  const now=Date.now();
  const current=memory.get(key);

  if(!current || current.reset<=now){
    memory.set(key,{
      count:1,
      reset:now+windowSeconds*1000
    });

    return {
      allowed:true,
      remaining:limit-1
    };
  }

  current.count++;

  return {
    allowed:current.count<=limit,
    remaining:Math.max(0,limit-current.count)
  };
}

export async function rateLimit(
  key:string,
  limit:number,
  windowSeconds:number
) {
  const c=client();

  if (c) {
    try {
      if (c.status !== 'ready') {
        return memoryRateLimit(key,limit,windowSeconds);
      }

      const bucket=`tamp:rl:${key}`;
      const n=await c.incr(bucket);

      if(n===1) {
        await c.expire(bucket,windowSeconds);
      }

      return {
        allowed:n<=limit,
        remaining:Math.max(0,limit-n)
      };
    } catch {
      return memoryRateLimit(key,limit,windowSeconds);
    }
  }

  return memoryRateLimit(key,limit,windowSeconds);
}

export function clientIp(request:Request){
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}
