import redisClient from "../../db/redis.client.js";

export const redisGet = (key) => {
  return redisClient.get(key);
};

export const redisSet = (key, value, ttl) => {
  if (ttl === undefined) {
    return redisClient.set(key, value);
  }

  return redisClient.set(key, value, {
    expiration: { type: "EX", value: ttl },
  });
};

export const redisDel = (key) => {
  return redisClient.del(key);
};

export const redisTTL = (key) => {
  return redisClient.ttl(key);
};

export const redisExpire = (key, expireIn) => {
  return redisClient.expire(key, expireIn);
};

export const redisExists = (key) => {
  return redisClient.exists(key);
};

export const redisIncr = (key) => {
  return redisClient.incr(key);
};
