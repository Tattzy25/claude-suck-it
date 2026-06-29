export const runtime = "nodejs"; // Force Node runtime for OpenAI SDK [web:42][web:44]

import OpenAI from "openai";
import Replicate from "replicate";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message ?? "";

    if (process.env.REPLICATE === "ENABLED") {
      const input: Record<string, unknown> = {
        prompt: message,
        images: body?.images ?? [],
        videos: body?.videos ?? [],
        thinking_level: body?.thinking_level ?? "high",
        temperature: body?.temperature ?? 1,
        top_p: body?.top_p ?? 0.95,
        max_output_tokens: body?.max_output_tokens ?? 65535,
      };

      if (typeof body?.audio === "string" && body.audio.length > 0) {
        input.audio = body.audio;
      }
      if (
        typeof body?.system_instruction === "string" &&
        body.system_instruction.length > 0
      ) {
        input.system_instruction = body.system_instruction;
      }
      if (typeof body?.video_fps === "number") {
        input.video_fps = body.video_fps;
      }

      const output: string[] = [];
      const model = (process.env.REPLICATE_MODEL ||
        "google/gemini-3.1-pro") as `${string}/${string}` | `${string}/${string}:${string}`;

      for await (const event of replicate.stream(model, { input })) {
        output.push(String(event));
      }

      return Response.json({
        reply: output.join(""),
        output,
      });
    }

    if (process.env.OPENAI === "ENABLED") {
      const response = await openai.responses.create({
        model: "gpt-5.4-2026-03-05",
        // Use the saved prompt correctly
        prompt: {
          id: "pmpt_6a412f57c7d081908dcf5618057a0c3c0aa930f566da5fb6",
          version: "1",
        },
        // Feed the widget's text into the model
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: message,
              },
            ],
          },
        ],
        reasoning: {
          summary: "auto",
        },
        // YOUR tools, unchanged
        tools: [
          {
            type: "file_search",
            vector_store_ids: ["vs_6a3eacca8db481918dd6f5236724cf4c"],
          },
          {
            type: "web_search",
            user_location: {
              type: "approximate",
            },
            search_context_size: "medium",
          },
          {
            type: "mcp",
            server_label: "tattty",
            server_url: "https://tattty.com/api/mcp",
            server_description:
              "search_catalog\nget_cart\nupdate_cart\nsearch_shop_policies_and_faqs\nget_product_details",
            allowed_tools: [
              "search_catalog",
              "get_cart",
              "update_cart",
              "search_shop_policies_and_faqs",
              "get_product_details",
            ],
            require_approval: "never",
          },
          {
            type: "mcp",
            server_label: "my_memory_server",
            server_url: "https://api.dify.ai/mcp/server/MqKUQPLna7UhsE5Z/mcp",
            server_description:
              "Add and retrieve memory at anytime (before and after any interactions is Recommended)  the system will automatically give you specialized skills for each user interactions",
            allowed_tools: ["MEMORY LANE"],
            require_approval: "never",
          },
        ],
        store: true,
        include: [
          "reasoning.encrypted_content",
          "web_search_call.action.sources",
        ],
        // Force a plain text output usable by the widget
        text: {
          format: {
            type: "text",
          },
        },
      });

      // Backend contract the widget must obey
      return Response.json({
        reply: response.output_text,
        output: response.output,
      });
    }

    return Response.json({ reply: "No provider enabled" }, { status: 500 });
  } catch (error: any) {
    return Response.json(
      {
        reply: error?.message ?? "Server error",
      },
      { status: 500 },
    );
  }
}
