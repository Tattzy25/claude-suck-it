export const runtime = "nodejs";

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

type ReplicateBody = {
  prompt: string;
  images?: string[];
  videos?: string[];
  audio?: string | null;
  video_fps?: number | null;
  system_instruction?: string | null;
  thinking_level?: "low" | "medium" | "high";
  temperature?: number;
  top_p?: number;
  max_output_tokens?: number;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ReplicateBody;

  const input = {
    prompt: body.prompt,
    images: body.images ?? [],
    videos: body.videos ?? [],
    audio: body.audio ?? null,
    video_fps: body.video_fps ?? null,
    system_instruction: body.system_instruction ?? null,
    thinking_level: body.thinking_level ?? "high",
    temperature: body.temperature ?? 1,
    top_p: body.top_p ?? 0.95,
    max_output_tokens: body.max_output_tokens ?? 65535,
  };

  const output: string[] = [];

  for await (const event of replicate.stream("google/gemini-3.1-pro", {
    input,
  })) {
    output.push(String(event));
  }

  return Response.json({
    output,
  });
}
