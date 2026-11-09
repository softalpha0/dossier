import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import { getAgentSidebarState, requestAgentSidebarOpen } from "@agent-native/core/client/agent-sidebar-state";

type TaskOptions = Omit<Parameters<typeof sendToAgentChat>[0], "newTab" | "openSidebar" | "submit">;

const composerReady = () => typeof document !== "undefined" && !!document.querySelector('[contenteditable="true"]');

/**
 * Run an AI task (voice check, committee review, story map…) in a chat of its own.
 *
 * A new chat means a long or stuck earlier chat can't hold the task in its queue.
 * But a new-chat message sent while the agent panel is still closed is dropped
 * (seen on the live site), so open the panel first and wait for its composer.
 */
export async function sendAgentTask(options: TaskOptions): Promise<void> {
  if (!getAgentSidebarState()?.open || !composerReady()) {
    requestAgentSidebarOpen();
    const start = Date.now();
    while (Date.now() - start < 5000 && !(getAgentSidebarState()?.open && composerReady())) {
      await new Promise((r) => setTimeout(r, 100));
    }
    // Let the freshly mounted panel finish wiring its listeners.
    await new Promise((r) => setTimeout(r, 400));
  }
  sendToAgentChat({ ...options, submit: true, newTab: true, openSidebar: true });
}
