import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_API_KEY = process.env.HF_API_KEY;
const ELEVEN_KEY = process.env.ELEVEN_KEY;

// Health check
app.get("/", (req, res) => {
  res.send(`API keys loaded: HF=${Boolean(HF_API_KEY)}, ELEVEN=${Boolean(ELEVEN_KEY)}`);
});

// Chat endpoint
app.post("/ask", async (req, res) => {
  try {
    if (!HF_API_KEY || !ELEVEN_KEY)
      return res.status(500).json({ error: "Missing API keys" });

    const userMessage = req.body.message || "";

    // 1️⃣ Get response text from language model
    const aiResp = await fetch(
  "https://router.huggingface.co/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [
        { role: "user", content: userMessage }
      ],
    }),
  }
);

const aiData = await aiResp.json();

if (!aiResp.ok) {
  console.error("HF ERROR:", aiData);
  return res.status(500).json({ error: aiData });
}

const textReply =
  aiData.choices?.[0]?.message?.content || "No reply.";

res.json({
  text: textReply
});

  } catch (err) {
    console.error("server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
