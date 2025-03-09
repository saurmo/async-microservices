import { Request, Response, NextFunction } from "express";

export function cacheHeadersMiddleware(_: Request, res: Response, next: NextFunction) {
  const cacheTime: number = Number(process.env.CACHE_TIME) || 300;
  res.setHeader("Cache-Control", `public, max-age=${cacheTime}`);  
  res.setHeader("X-Cache", "MISS"); 
  next();
}
