import { notFound } from "next/navigation";
import FollowupDockPreview from "./FollowupDockPreview";

export default function FollowupsPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <FollowupDockPreview />;
}
