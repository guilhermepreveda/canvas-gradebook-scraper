import dotenv from "dotenv";
dotenv.config();

const canvasUrl = process.env.CANVAS_URL;
const login = process.env.LOGIN;
const password = process.env.PASSWORD;
const port = process.env.PORT;

export { canvasUrl, login, password, port };
