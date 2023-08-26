import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3002; // Choose an appropriate port

app.use(bodyParser.json());

app.get("/", async (req, res) => {
  res.status(200).send({ success: 'Online' });
});

export function server() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
