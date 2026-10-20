import redisClient from "../../db/redis.client.js";

export const redisGet = (key) => {
  return redisClient.get(key);
};

export const redisSet = (key, value, ttl) => {
  return ttl
    ? redisClient.set(key, value, { EX: ttl })
    : redisClient.set(key, value);
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
