#!/usr/bin/env node

const endpoint = process.env.FLUXY_MCP_URL || "http://127.0.0.1:8000/api/v1/mcp/rpc";

let buffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() || "";

  for (const line of lines) {
    if (!line.trim()) continue;
    await handleLine(line);
  }
});

async function handleLine(line) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return;
  }

  if (!request.id) {
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    });

    const payload = await response.json();
    write(normalizeJsonRpc(payload));
  } catch (error) {
    write({
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32000,
        message: `Fluxy sidecar is not reachable at ${endpoint}: ${error.message}`,
      },
    });
  }
}

function write(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function normalizeJsonRpc(payload) {
  const normalized = { jsonrpc: payload.jsonrpc || "2.0", id: payload.id };
  if (payload.error) {
    normalized.error = payload.error;
  } else {
    normalized.result = payload.result ?? {};
  }
  return normalized;
}
