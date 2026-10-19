import { AgentUpstreamError, generateFollowupQuestions } from "@/lib/agent/resume-agent";
import { FollowupValidationError, parseFollowupRequest } from "@/lib/portfolio/followup-questions";

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  let followupRequest;
  try {
    followupRequest = parseFollowupRequest(payload);
  } catch (error) {
    return json({ error: error instanceof FollowupValidationError ? error.message : "Invalid follow-up request." }, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return json({ error: "Follow-up suggestions are not configured yet." }, 503);
  }

  try {
    return json(await generateFollowupQuestions({ ...followupRequest, apiKey }));
  } catch (error) {
    if (error instanceof AgentUpstreamError) {
      console.error("Portfolio follow-up upstream failure", {
        kind: error.kind,
        status: error.status,
        requestId: error.requestId,
        apiCode: error.apiCode,
      });
      return json({ error: "Follow-up suggestions are temporarily unavailable." }, 502);
    }
    return json({ error: "Follow-up suggestions encountered an unexpected error." }, 500);
  }
}
