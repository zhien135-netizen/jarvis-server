import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are JARVIS. Respond concisely." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "AI server error." });
  }
});

app.get("/", (req, res) => {
  res.send("JARVIS backend is running.");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
