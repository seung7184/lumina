import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { luminaDemo } from "@/lib/mock/lumina-demo";

export default function WorkspacePage() {
  return <WorkspaceShell demo={luminaDemo} />;
}
