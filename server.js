const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors()); // Table (Frontend) ko Kitchen se baat karne ki ijazat deta hai
app.use(express.json());

// Chef ko bulana aur usko Secret Password (API Key) dena
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Jab Frontend se order aayega:
app.post('/chat', async (req, res) => {
    const { prompt, model } = req.body;

    try {
        const stream = await openai.chat.completions.create({
            model: model || "gpt-4o",
            messages:[{ role: "user", content: prompt }],
            stream: true, // Word-by-word (Streaming) on kar di!
        });

        // Chef jo bhi word dega, hum foran Table par bhejenge
        for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            res.write(text);
        }
        res.end(); // Khana ready aur serve ho gaya

    } catch (error) {
        console.error(error);
        res.write("Error: Backend se connection fail ho gaya.");
        res.end();
    }
});

// Kitchen open karne ka time
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Kitchen is running on port ${port}!`));
