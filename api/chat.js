import { OpenAI } from 'openai';

// Yeh Vercel ka 'Edge' jaadu hai jo streaming ko fast aur free banata hai
export const config = { runtime: 'edge' };

export default async function handler(req) {
    // CORS: Yeh InfinityFree ko ijazat dega aapke backend se baat karne ki
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Pre-flight request pass karna
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (req.method !== 'POST') return new Response('Send a POST request', { status: 405 });

    const { prompt, model } = await req.json();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        const stream = await openai.chat.completions.create({
            model: model || "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            stream: true, // Word-by-word ON
        });

        // Response ko chote-chote tukdon (chunks) mein bhejna
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    controller.enqueue(new TextEncoder().encode(text));
                }
                controller.close();
            }
        });

        return new Response(readableStream, { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
    } catch (error) {
        return new Response('Error connecting to AI', { status: 500, headers: corsHeaders });
    }
}
