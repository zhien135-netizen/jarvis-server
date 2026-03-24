import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

// =========================
// 🧠 LOAD MEMORY FILE
// =========================
let memory = {};
let currentUser = "default";

try {
  const data = fs.readFileSync("memory.json", "utf-8");
  memory = JSON.parse(data);
} catch (err) {
  console.log("No memory file found, starting fresh.");
}

// =========================
// 💾 SAVE MEMORY
// =========================
function saveMemory() {
  fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

// =========================
// 🌐 ROOT ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("JARVIS backend is running");
});

// =========================
// 🤖 MAIN AI ROUTE
// =========================
app.post("/ask", async (req, res) => {

  const userMessage = req.body.message.toLowerCase();

  // =========================
  // 👤 SWITCH USER
  // =========================
  if (userMessage.startsWith("switch user")) {
    const name = userMessage.replace("switch user", "").trim();

    currentUser = name;

    if (!memory[currentUser]) {
      memory[currentUser] = {};
    }

    return res.json({
      reply: `Switched to user ${name}.`
    });
  }

  // =========================
  // 🧠 WHO AM I
  // =========================
  if (userMessage === "who am i") {
    return res.json({
      reply: `You are ${currentUser}.`
    });
  }

  // =========================
  // 🧠 MEMORY SAVE
  // =========================
  if (userMessage.startsWith("remember")) {
    const info = userMessage.replace("remember", "").trim();
    const parts = info.split(" is ");

    if (parts.length === 2) {
      const key = parts[0].trim();
      const value = parts[1].trim();

      if (!memory[currentUser]) {
        memory[currentUser] = {};
      }

      memory[currentUser][key] = value;

      saveMemory();

      return res.json({
        reply: `Got it. I will remember that your ${key} is ${value}.`
      });
    }
  }

  // =========================
  // 🤖 AI RESPONSE
  // =========================
  try {
    const userMemory = memory[currentUser] || {};

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are JARVIS, a smart AI assistant.
Current user: ${currentUser}
User memory: ${JSON.stringify(userMemory)}`
          },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

// 🔍 DEBUG (VERY IMPORTANT)
console.log("OpenAI response:", data);

const reply = data?.choices?.[0]?.message?.content || "No response";

res.json({
  reply,
  debug: data
});

  } catch (err) {
    console.error(err);
    res.json({ reply: "Error contacting AI." });
  }

});

// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
