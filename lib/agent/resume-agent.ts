import { getResumeProfile } from "@/lib/portfolio/resume-profile";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentAnswer = {
  message: string;
  presentation: "text" | "profile_card";
};

export const MAX_USER_TURNS = 15;
export const MAX_MESSAGE_CHARS = 1_000;

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_REQUEST_TIMEOUT_MS = 15_000;
const MODEL = "gpt-5.6-luna";
const TOOL_NAME = "get_resume_profile";

const INSTRUCTIONS = `You are the first-person portfolio voice for Hongxiang Wang.
This first development slice only supports questions about Hongxiang himself: his background, education, experience, and skills.
Always use get_resume_profile before answering. Treat its output as the only source of factual claims.
If the tool does not contain an answer, say that the information is not available in the public resume. Do not guess or embellish.
Answer in the same language as the visitor. Use first person, a warm professional tone, and two to four concise sentences.
Choose presentation "profile_card" only when the visitor asks for a broad identity, self-introduction, or personal overview, such as "Who are you?", "Tell me about yourself.", or "介绍一下你自己". Use "text" for specific questions about education, experience, projects, skills, contact details, or anything else.
Do not claim that this is a live conversation with a human.`;

const ANSWER_FORMAT = {
  type: "json_schema",
  name: "portfolio_answer",
  strict: true,
  schema: {
    type: "object",
    properties: {
      message: { type: "string" },
      presentation: {
        type: "string",
        enum: ["text", "profile_card"],
      },
    },
    required: ["message", "presentation"],
    additionalProperties: false,
  },
} as const;

const RESUME_PROFILE_TOOL = {
  type: "function",
  name: TOOL_NAME,
  description:
    "Fetch Hongxiang Wang's approved public profile facts extracted from his resume.",
  parameters: {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  },
  strict: true,
} as const;

type JsonObject = Record<string, unknown>;

type OpenAIResponse = {
  output: JsonObject[];
  output_text?: string;
};

type FunctionCall = JsonObject & {
  type: "function_call";
  call_id: string;
  name: string;
  arguments: string;
};

export class ChatValidationError extends Error {}

export class AgentUpstreamError extends Error {
  constructor(
    message: string,
    readonly kind:
      | "authentication"
      | "rate_limit"
      | "timeout"
      | "network"
      | "upstream" = "upstream",
    readonly status?: number,
    readonly requestId?: string,
    readonly apiCode?: string,
  ) {
    super(message);
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFunctionCall(item: JsonObject): item is FunctionCall {
  return (
    item.type === "function_call" &&
    typeof item.call_id === "string" &&
    typeof item.name === "string" &&
    typeof item.arguments === "string"
  );
}

export function parseChatMessages(payload: unknown): ChatMessage[] {
  if (!isObject(payload) || !Array.isArray(payload.messages)) {
    throw new ChatValidationError("A messages array is required.");
  }

  if (payload.messages.length === 0 || payload.messages.length > MAX_USER_TURNS * 2 - 1) {
    throw new ChatValidationError("The conversation must contain between 1 and 29 messages.");
  }

  const messages = payload.messages.map((item, index) => {
    if (!isObject(item) || (item.role !== "user" && item.role !== "assistant")) {
      throw new ChatValidationError("Each message must have a supported role.");
    }

    if (typeof item.content !== "string") {
      throw new ChatValidationError("Each message must contain text.");
    }

    const content = item.content.trim();
    if (content.length === 0 || content.length > MAX_MESSAGE_CHARS) {
      throw new ChatValidationError(
        `Each message must contain 1-${MAX_MESSAGE_CHARS} characters.`,
      );
    }

    const expectedRole = index % 2 === 0 ? "user" : "assistant";
    if (item.role !== expectedRole) {
      throw new ChatValidationError("Messages must alternate between user and assistant.");
    }

    return { role: item.role, content };
  });

  if (messages.at(-1)?.role !== "user") {
    throw new ChatValidationError("The last message must be from the user.");
  }

  return messages;
}

function parseOpenAIResponse(value: unknown): OpenAIResponse {
  if (!isObject(value) || !Array.isArray(value.output)) {
    throw new AgentUpstreamError("OpenAI returned an invalid response.");
  }

  const output = value.output.filter(isObject);
  if (output.length !== value.output.length) {
    throw new AgentUpstreamError("OpenAI returned an invalid output item.");
  }

  return {
    output,
    output_text: typeof value.output_text === "string" ? value.output_text : undefined,
  };
}

async function createResponse(
  apiKey: string,
  body: JsonObject,
  fetchImpl: typeof fetch,
): Promise<OpenAIResponse> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_REQUEST_TIMEOUT_MS);

  try {
    response = await fetchImpl(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new AgentUpstreamError(
      controller.signal.aborted
        ? "OpenAI took too long to respond."
        : "OpenAI could not be reached.",
      controller.signal.aborted ? "timeout" : "network",
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AgentUpstreamError(
      "OpenAI returned unreadable data.",
      "upstream",
      response.status,
      response.headers.get("x-request-id") ?? undefined,
    );
  }

  if (!response.ok) {
    const apiError = isObject(payload) && isObject(payload.error) ? payload.error : null;
    const apiCode =
      apiError && typeof apiError.code === "string" ? apiError.code : undefined;
    const kind =
      response.status === 401 || response.status === 403
        ? "authentication"
        : response.status === 429
          ? "rate_limit"
          : "upstream";

    throw new AgentUpstreamError(
      "OpenAI rejected the request.",
      kind,
      response.status,
      response.headers.get("x-request-id") ?? undefined,
      apiCode,
    );
  }

  return parseOpenAIResponse(payload);
}

function executeResumeTool(call: FunctionCall): string {
  if (call.name !== TOOL_NAME) {
    throw new AgentUpstreamError("The model requested an unsupported tool.");
  }

  let argumentsValue: unknown;
  try {
    argumentsValue = JSON.parse(call.arguments);
  } catch {
    throw new AgentUpstreamError("The model returned invalid tool arguments.");
  }

  if (!isObject(argumentsValue) || Object.keys(argumentsValue).length !== 0) {
    throw new AgentUpstreamError("The model returned unexpected tool arguments.");
  }

  return JSON.stringify(getResumeProfile());
}

function extractOutputText(response: OpenAIResponse): string {
  if (response.output_text?.trim()) {
    return response.output_text.trim();
  }

  const text = response.output
    .filter((item) => item.type === "message" && Array.isArray(item.content))
    .flatMap((item) => item.content as unknown[])
    .filter(isObject)
    .filter((part) => part.type === "output_text" && typeof part.text === "string")
    .map((part) => part.text as string)
    .join("")
    .trim();

  if (!text) {
    throw new AgentUpstreamError("OpenAI returned no answer.");
  }

  return text;
}

function extractAgentAnswer(response: OpenAIResponse): AgentAnswer {
  let value: unknown;

  try {
    value = JSON.parse(extractOutputText(response));
  } catch {
    throw new AgentUpstreamError("OpenAI returned an invalid structured answer.");
  }

  if (
    !isObject(value) ||
    typeof value.message !== "string" ||
    !["text", "profile_card"].includes(String(value.presentation))
  ) {
    throw new AgentUpstreamError("OpenAI returned an invalid structured answer.");
  }

  const message = value.message.trim();
  if (!message) {
    throw new AgentUpstreamError("OpenAI returned an empty answer.");
  }

  return {
    message,
    presentation: value.presentation as AgentAnswer["presentation"],
  };
}

export async function answerFromResume({
  messages,
  apiKey,
  fetchImpl = fetch,
}: {
  messages: ChatMessage[];
  apiKey: string;
  fetchImpl?: typeof fetch;
}): Promise<AgentAnswer> {
  const firstResponse = await createResponse(
    apiKey,
    {
      model: MODEL,
      instructions: INSTRUCTIONS,
      input: messages,
      tools: [RESUME_PROFILE_TOOL],
      tool_choice: { type: "function", name: TOOL_NAME },
      parallel_tool_calls: false,
      reasoning: { effort: "none" },
      text: { verbosity: "low" },
      max_output_tokens: 300,
      store: false,
    },
    fetchImpl,
  );

  const toolCalls = firstResponse.output.filter(isFunctionCall);
  if (toolCalls.length !== 1) {
    throw new AgentUpstreamError("The model did not make exactly one resume tool call.");
  }

  const toolCall = toolCalls[0];
  const toolOutput = executeResumeTool(toolCall);
  const finalInput: unknown[] = [
    ...messages,
    ...firstResponse.output,
    {
      type: "function_call_output",
      call_id: toolCall.call_id,
      output: toolOutput,
    },
  ];

  const finalResponse = await createResponse(
    apiKey,
    {
      model: MODEL,
      instructions: INSTRUCTIONS,
      input: finalInput,
      tools: [RESUME_PROFILE_TOOL],
      tool_choice: "none",
      parallel_tool_calls: false,
      reasoning: { effort: "none" },
      text: { format: ANSWER_FORMAT, verbosity: "low" },
      max_output_tokens: 300,
      store: false,
    },
    fetchImpl,
  );

  return extractAgentAnswer(finalResponse);
}
