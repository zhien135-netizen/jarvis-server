import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

app.post("/ask", async (req, res) => {

  const userMessage = req.body.message;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are JARVIS, a smart AI assistant." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content || "No response";

res.json({ reply });

  } catch (err) {
    res.json({ reply: "Error contacting AI." });
  }

});

app.get("/", (req, res) => {
  res.send("JARVIS backend is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
})
