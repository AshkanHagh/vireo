import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route";
import { RouteNowFoundError } from "./libs/utils";
import { ErrorMiddleware } from "./middlewares/error";
import { migration } from "./database/migrate";

const app = express();
await migration();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.ORIGIN }));
app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.get("/", (req: Request, res: Response) =>
  res.status(200).json({ success: true, message: "Welcome" }),
);

app.use("/api/v2/auth", authRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/posts", postRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new RouteNowFoundError(`Route : ${req.originalUrl} not found`));
});

app.use(ErrorMiddleware);
export { app };
