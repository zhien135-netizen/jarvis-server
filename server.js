import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

// =========================
// 🧠 MEMORY
// =========================
let memory = {};
let currentUser = "default";

try {
  const data = fs.readFileSync("memory.json", "utf-8");
  memory = JSON.parse(data);
} catch {
  console.log("No memory file found, starting fresh.");
}

function saveMemory() {
  fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

// =========================
// 🌐 ROOT
// =========================
app.get("/", (req, res) => {
  res.send("JARVIS backend is running (FREE MODE)");
});

// =========================
// 🤖 ASK ROUTE
// =========================
app.post("/ask", async (req, res) => {

  const userMessage = req.body.message.toLowerCase();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://zhien135-netizen.github.io",
        "X-Title": "Jarvis"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are JARVIS, a smart AI assistant. Be confident, slightly witty, but still concise."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    console.log("AI RESPONSE:", data);

    let reply = "No response";

    if (data.error) {
      reply = "AI error: " + data.error.message;
    } else if (data.choices && data.choices.length > 0) {
      reply = data.choices[0].message.content;
    }

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Server error" });
  }

});

// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
