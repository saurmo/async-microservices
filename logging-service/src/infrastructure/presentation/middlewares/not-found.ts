import { Request, Response } from "express";
export const handlerMiddlewareNotFound = (_: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
};
