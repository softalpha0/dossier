import {
  markAgentChatHomeHandoff,
  navigateWithAgentChatViewTransition,
} from "@agent-native/core/client/agent-chat";
import { createAgentNativeAgentKitTransport } from "@agent-native/core/client/agentkit-chat/transport";
import { useT } from "@agent-native/core/client/i18n";
import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import { AgentKitComposer } from "@agent-native/toolkit/app/agentkit/react/components";
import { useAgentKitControl } from "@agent-native/toolkit/app/agentkit/react/context";
import { CoreComposerRuntimeProvider } from "@agent-native/toolkit/app/chat/agentkit-chat/composer";
import { CoreAgentKitRoot } from "@agent-native/toolkit/app/chat/agentkit-chat/index";
import { useRealtimeVoiceModeOptional } from "@agent-native/toolkit/app/chat/composer";
import { WaveBackground } from "@agent-native/toolkit/app/shared";
import { AgentNativeIcon } from "@agent-native/toolkit/app/shared/AgentNativeIcon";
import {
  IconBook,
  IconBrandDiscord,
  IconBrandGithub,
  IconUsers,
} from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";

import { useChatComposerMenuItems } from "@/components/ChatComposerContext";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { getChatHomeThreadId } from "@/lib/chat-home-thread";
import {
  chatHandoffComposerOptions,
  chatThreadPath,
  type ChatInitialComposerOptions,
  type ChatRouteState,
} from "@/lib/chat-paths";
import { TAB_ID } from "@/lib/tab-id";

const DOCS_URL = "https://www.agent-native.com/docs";
const GITHUB_URL = "https://github.com/BuilderIO/agent-native";
const DISCORD_URL = "https://discord.gg/qm82StQ2NC";

/**
 * The same AgentKit composer the chat page uses, so Connect AI and the model
 * picker look the way they will in chat. Submitting hands the prompt to the
 * full chat page instead of running it here, and voice chat continues there.
 */
function HomeAgentComposer() {
  const navigate = useNavigate();
  const realtimeVoice = useRealtimeVoiceModeOptional();
  const [threadId] = useState(getChatHomeThreadId);
  const [transport] = useState(() =>
    createAgentNativeAgentKitTransport({
      browserTabId: TAB_ID,
      surface: "app",
      adapter: { textFormat: "markdown" },
    }),
  );

  function openChat(
    message: string,
    options: ChatInitialComposerOptions,
    onLocalSubmit?: () => void,
  ) {
    const state: ChatRouteState = {
      initialMessage: message,
      initialComposerOptions: options,
    };
    markAgentChatHomeHandoff("chat");
    navigateWithAgentChatViewTransition(navigate, chatThreadPath(threadId), {
      state,
    });
    onLocalSubmit?.();
  }

  function startVoiceChat() {
    // Home shows no transcript, so the session is bound to the thread it
    // opens rather than to whichever thread is on screen when it starts.
    void realtimeVoice?.start({ threadId });
    markAgentChatHomeHandoff("chat");
    navigateWithAgentChatViewTransition(navigate, chatThreadPath(threadId));
  }

  return (
    <div
      className="agentkit-tokens w-full max-w-[calc(var(--agent-kit-conversation-max-width,47rem)-2rem)] text-start"
      data-agentkit-composer-size="large"
    >
      <CoreComposerRuntimeProvider>
        <CoreAgentKitRoot
          transport={transport}
          clientOptions={{ transportOwnership: "owned" }}
          threadId={threadId}
        >
          <HomeAgentComposerInput
            threadId={threadId}
            onSubmit={openChat}
            onVoiceChatStart={startVoiceChat}
          />
        </CoreAgentKitRoot>
      </CoreComposerRuntimeProvider>
    </div>
  );
}

function HomeAgentComposerInput({
  threadId,
  onSubmit,
  onVoiceChatStart,
}: {
  threadId: string;
  onSubmit: (
    text: string,
    options: ChatInitialComposerOptions,
    onLocalSubmit?: () => void,
  ) => void;
  onVoiceChatStart: () => void;
}) {
  const t = useT();
  const control = useAgentKitControl(threadId);
  const contextMenuItems = useChatComposerMenuItems();

  return (
    <AgentKitComposer
      threadId={threadId}
      requireAgentEngine
      placeholder={t("chat.composerPlaceholder")}
      plusMenuMode="full"
      contextMenuItems={contextMenuItems}
      voiceEnabled
      onVoiceChatStart={onVoiceChatStart}
      onSubmit={async (text, files, references, options) => {
        const uploadedAttachments = files.length
          ? await control.uploadFiles(
              files.map((file) => ({
                name: file.name,
                mediaType: file.type || "application/octet-stream",
                size: file.size,
                body: file,
              })),
            )
          : [];
        onSubmit(
          text,
          chatHandoffComposerOptions(options, {
            references,
            ...(uploadedAttachments.length ? { uploadedAttachments } : {}),
          }),
          options.onLocalSubmit,
        );
      }}
    />
  );
}

function ResourceLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} target="_blank" rel="noreferrer">
        {icon}
        {children}
      </a>
    </Button>
  );
}

function ResourceColumn({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Item asChild className="content-start px-6 py-8 sm:px-10">
      <section>
        <ItemMedia variant="icon">{icon}</ItemMedia>
        <ItemContent>
          <ItemTitle role="heading" aria-level={2}>
            {title}
          </ItemTitle>
        </ItemContent>
        <ItemFooter className="flex-wrap justify-start">{children}</ItemFooter>
      </section>
    </Item>
  );
}

const STARTERS = [
  "What's due in the next two weeks?",
  "Check my eligibility for all my programs.",
  "Help me write a story about a time I led something.",
  "Which of my answers is weakest right now, and why?",
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div>
          <h1 className="dossier-serif text-4xl font-medium tracking-tight sm:text-5xl">Ask Dossier</h1>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Your application coach. It reads program calls, drafts from your own stories, and
            proposes edits you accept or reject — it never submits anything for you.
          </p>
        </div>
        <HomeAgentComposer />
        <ul className="flex max-w-2xl flex-wrap justify-center gap-2" aria-label="Try asking">
          {STARTERS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => sendToAgentChat({ message: s, submit: true, newTab: true, openSidebar: true })}
                className="min-h-10 rounded-full border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
