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
  "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: userMessage,
    }),
  }
);

const aiData = await aiResp.json();

if (!aiResp.ok) {
  console.error("HF ERROR:", aiData);
  return res.status(500).json({ error: aiData });
}

let textReply = "I have no reply.";

if (Array.isArray(aiData)) {
  textReply = aiData[0]?.generated_text || textReply;
} else if (aiData.generated_text) {
  textReply = aiData.generated_text;
}

    // 2️⃣ Generate audio with ElevenLabs
    const voiceId = "TxGEqnHWrfWFTfGW9XjX"; // default voice
    const voiceResp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_KEY,
        },
        body: JSON.stringify({ text: textReply }),
      }
    );

    const audioArrayBuffer = await voiceResp.arrayBuffer();
    const base64Audio = Buffer.from(audioArrayBuffer).toString("base64");

    // Return JSON with text + base64 audio
    res.json({
      text: textReply,
      audio: `data:audio/mpeg;base64,${base64Audio}`,
    });

  } catch (err) {
    console.error("server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
