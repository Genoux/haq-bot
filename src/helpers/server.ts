import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3002; // Dynamically assign port

app.use(bodyParser.json());

app.get("/", async (req: Request, res: Response) => {
  res.status(200).send({ success: 'Online - 1.1.0' });
});

export function server() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  }).on('error', (err) => {
    console.error('Error starting server:', err);
  });
}
