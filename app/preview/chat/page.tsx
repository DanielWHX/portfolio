import { notFound } from "next/navigation";
import ChatDesignPreview from "./ChatDesignPreview";
import "@/app/chat/chat-design.css";

export default function ChatPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ChatDesignPreview />;
}
