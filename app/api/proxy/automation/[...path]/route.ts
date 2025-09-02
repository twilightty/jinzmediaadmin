import type { NextRequest } from "next/server"

const BASE_URL = "https://atmt.jinzmedia.com/api/v1/admin"

async function handle(req: NextRequest, { params }: { params: { path?: string[] } }) {
  const path = (params.path || []).join("/")
  const url = new URL(req.url)
  const search = url.search
  const target = `${BASE_URL}/${path}${search}`

  const headers: Record<string, string> = {}
  // Pass through auth and content headers
  const auth = req.headers.get("authorization")
  if (auth) headers["authorization"] = auth
  const contentType = req.headers.get("content-type")
  if (contentType) headers["content-type"] = contentType
  headers["accept"] = "application/json"

  const init: RequestInit = {
    method: req.method,
    headers,
    // Only forward body for methods that can have a body
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    cache: "no-store",
  }

  try {
    const res = await fetch(target, init)
    const text = await res.text()
    return new Response(text, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    })
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Proxy request failed",
        error: e?.message || "Unknown error",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    )
  }
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE }


