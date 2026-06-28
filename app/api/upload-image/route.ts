export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  const forward = new FormData();
  if (file) {
    forward.append("file", file);
  }

  const response = await fetch("https://model.avi-kay2019.workers.dev", {
    method: "POST",
    body: forward,
  });

  const raw = await response.text();

  if (!response.ok) {
    return new Response(raw || "Upload failed", { status: response.status });
  }

  let url = raw.trim();
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      url = parsed;
    } else if (typeof parsed?.url === "string") {
      url = parsed.url;
    } else if (typeof parsed?.image_url === "string") {
      url = parsed.image_url;
    } else if (typeof parsed?.image === "string") {
      url = parsed.image;
    }
  } catch {
    // keep raw response text
  }

  return Response.json({ url });
}
