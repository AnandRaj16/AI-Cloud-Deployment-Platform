
import "dotenv/config";
import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import { getAllFiles } from "./file";
import path from "path";
import { uploadFile } from "./aws";
import { createClient } from "redis";
const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors())
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate(); // asd12
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);
    })

    await new Promise((resolve) => setTimeout(resolve, 5000))
    publisher.lPush("build-queue", id);
    // INSERT => SQL
    // .create => 
    publisher.hSet("status", id, "uploaded");

    res.json({
        id: id
    })

});

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.post("/ask", async (req, res) => {
    const prompt = req.body?.prompt as string | undefined;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!prompt || !prompt.trim()) {
        res.status(400).json({ error: "Prompt is required" });
        return;
    }

    if (!groqApiKey) {
        res.status(500).json({ error: "GROQ_API_KEY is not configured" });
        return;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    { role: "system", content: "You are a concise, helpful AI assistant." },
                    { role: "user", content: prompt.trim() },
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            res.status(502).json({ error: `Groq API error: ${errorText}` });
            return;
        }

        const data = await response.json() as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        const answer = data.choices?.[0]?.message?.content?.trim() || "No response generated.";
        res.json({ answer });
    } catch (error) {
        console.error("Ask API failed:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
});

app.listen(3000);
