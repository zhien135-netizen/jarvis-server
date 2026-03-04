const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const API_KEY = process.env.API_KEY;

// Root check
app.get("/", (req, res) => {
  res.send("JARVIS backend is running.");
});

// AI endpoint
app.post("/ask", async (req, res) => {
  try {

    if (!API_KEY) {
      console.error("API_KEY is missing!");
      return res.status(500).json({ error: "API key missing" });
    }

    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are JARVIS, a sarcastic but intelligent AI assistant."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DeepSeek error:", data);
      return res.status(500).json({ error: data });
    }

    const reply = data.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("Server crash:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
