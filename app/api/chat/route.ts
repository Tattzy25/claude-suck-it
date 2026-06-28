import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.responses.create({
  model: "gpt-5.4-2026-03-05",
  prompt: {
    "id": "pmpt_6a412f57c7d081908dcf5618057a0c3c0aa930f566da5fb6",
    "version": "1"
  },
  input: [],
  reasoning: {
    "summary": "auto"
  },
  tools: [
    {
      "type": "file_search",
      "vector_store_ids": [
        "vs_6a3eacca8db481918dd6f5236724cf4c"
      ]
    },
    {
      "type": "web_search",
      "user_location": {
        "type": "approximate"
      },
      "search_context_size": "medium"
    },
    {
      "type": "image_generation",
      "model": "gpt-image-2",
      "size": "auto",
      "quality": "auto",
      "output_format": "png",
      "background": "auto",
      "moderation": "auto",
      "partial_images": 0
    },
    {
      "type": "mcp",
      "server_label": "tattty",
      "server_url": "https://tattty.com/api/mcp",
      "server_description": "search_catalog\nget_cart\nupdate_cart\nsearch_shop_policies_and_faqs\nget_product_details",
      "allowed_tools": [
        "search_catalog",
        "get_cart",
        "update_cart",
        "search_shop_policies_and_faqs",
        "get_product_details"
      ],
      "require_approval": "always"
    },
    {
      "type": "mcp",
      "server_label": "my_mcp_tattoo_server",
      "server_url": "https://98e8422c-f118-4831-be30-dca52a069eb5.search.ai.cloudflare.com/mcp",
      "server_description": "search and find products, indexed on cloudflare AI semantic search",
      "allowed_tools": [
        "search"
      ],
      "require_approval": "always"
    },
    {
      "type": "mcp",
      "server_label": "tattty_mcp_server",
      "server_url": "https://api.dify.ai/mcp/server/vIKsLS3ToLV1yeUx/mcp",
      "server_description": "image generating mcp server for tattoos directly",
      "allowed_tools": [
        "Artists N Models"
      ],
      "require_approval": "always"
    },
    {
      "type": "mcp",
      "server_label": "my_memory_server",
      "server_url": "https://api.dify.ai/mcp/server/MqKUQPLna7UhsE5Z/mcp",
      "server_description": "Add and retrieve memory at anytime (before and after any interactions is Recommended)  the system will automatically give you specialized skills for each user interactions",
      "allowed_tools": [
        "MEMORY LANE"
      ],
      "require_approval": "always"
    }
  ],
  store: true,
  include: [
    "reasoning.encrypted_content",
    "web_search_call.action.sources"
  ]
});