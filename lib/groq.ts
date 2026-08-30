import Groq from "groq-sdk";

// Groq's free tier vision-capable model as of Aug 2026. Served as "preview" —
// if Groq deprecates it, check https://console.groq.com/docs/vision for the
// current vision model id and swap it in here.
const VISION_MODEL = "qwen/qwen3.6-27b";
// Text-only reasoning calls (mapping, grading) can use a cheaper/faster model.
const TEXT_MODEL = "qwen/qwen3.6-27b";

function getClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GROQ_API_KEY is not set. Add it to your .env.local file. Get a free key (no card required) at https://console.groq.com/keys"
        );
    }
    return new Groq({ apiKey });
}

export type ImagePart = {
    base64: string; // raw base64, no data: prefix
    mimeType: string; // e.g. image/png, image/jpeg
};

/**
 * Calls Groq with an optional image + a text prompt, forcing a JSON response.
 */
export async function generateJSON<T>(params: {
    prompt: string;
    image?: ImagePart;
    temperature?: number;
}): Promise<T> {
    const { prompt, image, temperature = 0.1 } = params;
    const client = getClient();

    const content: any[] = [{ type: "text", text: prompt }];
    if (image) {
        content.push({
            type: "image_url",
            image_url: { url: `data:${image.mimeType};base64,${image.base64}` },
        });
    }

    try {
        const completion = await client.chat.completions.create({
            model: image ? VISION_MODEL : TEXT_MODEL,
            temperature,
            max_completion_tokens: 4096,
            reasoning_effort: "none",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content }],
        });

        const text = completion.choices[0]?.message?.content ?? "";
        return parseJsonLoose<T>(text);
    } catch (err: any) {
        // Groq's strict JSON mode occasionally returns an empty/invalid
        // generation (json_validate_failed) on vision calls. Retry once without
        // forcing response_format, relying on the prompt's own JSON instructions.
        const isJsonValidationError =
            err?.status === 400 ||
            String(err?.message ?? "").includes("json_validate_failed");

        if (!isJsonValidationError) throw err;

        const completion = await client.chat.completions.create({
            model: image ? VISION_MODEL : TEXT_MODEL,
            temperature,
            max_completion_tokens: 4096,
            reasoning_effort: "none",
            messages: [{ role: "user", content }],
        });

        const text = completion.choices[0]?.message?.content ?? "";
        return parseJsonLoose<T>(text);
    }
}

function parseJsonLoose<T>(text: string): T {
    // qwen3.6-27b is a hybrid reasoning model and sometimes prepends a
    // <think>...</think> block before the actual JSON answer. Strip it.
    const withoutThink = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    try {
        return JSON.parse(withoutThink) as T;
    } catch {
        // Some responses omit the closing tag or wrap in markdown fences —
        // fall back to extracting the first {...} or [...] block we can find.
        const cleaned = withoutThink.replace(/```json|```/g, "").trim();
        try {
            return JSON.parse(cleaned) as T;
        } catch {
            const match = cleaned.match(/[{[][\s\S]*[}\]]/);
            if (match) {
                return JSON.parse(match[0]) as T;
            }
            throw new Error(
                `Model response wasn't valid JSON after cleanup: ${cleaned.slice(0, 200)}`
            );
        }
    }
}