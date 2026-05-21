import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const SYSTEM_SIMPLE = `You are a friendly mortgage education assistant for LoansBetter.
Answer the user's mortgage question in 2-3 SHORT, plain-English sentences.
No jargon — imagine explaining to someone who has never dealt with a mortgage before.
Be warm, calm, and reassuring. Do not use bullet points or headers. Keep it under 70 words.
Never give financial advice or tell someone what to do — only explain concepts clearly.`;

const SYSTEM_DEEP = `You are a knowledgeable mortgage education assistant for LoansBetter.
Give a thorough, well-structured explanation of the user's mortgage question.
Write in plain English — no unnecessary jargon. When you must use a term, briefly define it.
Use bullet points and short sections where helpful. Be calm and educational, not salesy.
Never tell someone what to do — only explain concepts so they can decide for themselves.
Limit to 350 words max.`;

router.post("/learn/ask", async (req, res) => {
  const { question, mode } = req.body as { question?: string; mode?: string };

  if (!question || typeof question !== "string") {
    res.status(400).json({ error: "question is required" });
    return;
  }

  const systemPrompt = mode === "deep" ? SYSTEM_DEEP : SYSTEM_SIMPLE;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: mode === "deep" ? 600 : 150,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    const answer = completion.choices[0]?.message?.content ?? "I wasn't able to generate an answer. Please try again.";
    res.json({ answer });
  } catch (err) {
    req.log.error(err, "learn/ask AI error");
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
