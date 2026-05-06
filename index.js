const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chat', async (req, res) => {
    const { prompt, model } = req.body;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
        const stream = await openai.chat.completions.create({
            model: model || "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            res.write(content); // Ek ek lafz bhej raha hai
        }
        res.end();
    } catch (error) {
        res.status(500).send("Error: API Key check karein ya balance khatam hai.");
    }
});

app.listen(8080, () => console.log("Server is live on port 8080"));
