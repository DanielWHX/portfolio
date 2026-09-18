import {
  AgentUpstreamError,
  ChatValidationError,
  answerFromResume,
  parseChatMessages,
} from "@/lib/agent/resume-agent";
import { getResumeOverviewCard } from "@/lib/portfolio/resume-profile";
import { isProjectsOverviewRequest } from "@/lib/portfolio/projects";
import { contactProfile } from "@/lib/portfolio/contact-profile";

function json(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  let messages;
  try {
    messages = parseChatMessages(payload);
  } catch (error) {
    const message =
      error instanceof ChatValidationError ? error.message : "Invalid chat request.";
    return json({ error: message }, 400);
  }

  if (isProjectsOverviewRequest(messages[messages.length - 1].content)) {
    return json({ message: "Explore my selected work, starting with Lyntra.", module: { type: "projects" } });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return json(
      { error: "The portfolio agent is not configured yet. Add OPENAI_API_KEY locally." },
      503,
    );
  }

  try {
    const answer = await answerFromResume({ messages, apiKey });

    if (answer.presentation === "projects_card") {
      return json({ message: answer.message, module: { type: "projects" } });
    }

    if (answer.presentation === "contact_card") {
      return json({
        message: answer.message,
        module: { type: "contact", contact: contactProfile },
      });
    }

    if (answer.presentation === "profile_card") {
      return json({
        message: answer.message,
        module: {
          type: "profile",
          profile: getResumeOverviewCard(answer.message),
        },
      });
    }

    return json({ message: answer.message });
  } catch (error) {
    if (error instanceof AgentUpstreamError) {
      console.error("Portfolio agent upstream failure", {
        kind: error.kind,
        status: error.status,
        requestId: error.requestId,
        apiCode: error.apiCode,
      });

      const message =
        error.kind === "authentication"
          ? "The portfolio agent is not configured correctly."
          : error.kind === "rate_limit"
            ? "The portfolio agent is temporarily rate-limited."
            : error.kind === "network" || error.kind === "timeout"
              ? "The portfolio agent cannot reach OpenAI right now."
              : "I couldn't answer right now. Please try again.";

      return json({ error: message }, 502);
    }

    return json({ error: "The portfolio agent encountered an unexpected error." }, 500);
  }
}
