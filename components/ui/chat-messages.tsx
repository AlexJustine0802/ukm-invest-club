"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp?: string;
  /** Shown above the bubble. Omit in a two-party chat. */
  authorName?: string;
  /** Sits above the name, quieter — the person is what you read first. */
  authorRole?: string;
  /** Letter in the avatar circle; falls back to the assistant sparkle. */
  authorInitial?: string;
  /** Tailwind classes for that avatar, so each author keeps one colour. */
  authorClassName?: string;
}

export interface ChatMessagesProps {
  messages?: ChatMessage[];
  autoPlay?: boolean;
  autoPlayDelay?: number;
  typingDuration?: number;
  showReplay?: boolean;
  interactive?: boolean;
  className?: string;
  /** Header title, subtitle and icon. */
  title?: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;
  /**
   * Replaces the built-in input. A real conversation posts through a server
   * action, which the demo input cannot do.
   */
  footer?: React.ReactNode;
  /** Rendered in the message area when there is nothing to show. */
  emptyState?: React.ReactNode;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    sender: "assistant",
    content:
      "Hello! I'm your Nexus AI assistant. How can I help you build something amazing today?",
  },
  {
    id: "2",
    sender: "user",
    content: "I want to create a beautiful landing page for my SaaS product.",
  },
];

function TypingIndicator({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl rounded-tl-md border border-slate-200 bg-slate-100 px-4 py-3",
        className,
      )}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400"
          animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex items-end gap-2", isUser && "flex-row-reverse")}>
        {!isUser && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary",
              message.authorClassName,
            )}
          >
            {message.authorInitial ?? <Sparkles className="size-4" />}
          </div>
        )}
        <div
          className={cn(
            "flex min-w-0 max-w-[75%] flex-col",
            isUser && "items-end",
          )}
        >
          {(message.authorName || message.authorRole) && (
            <div className={cn("mb-1 px-1", isUser && "text-right")}>
              {message.authorRole && (
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {message.authorRole}
                </p>
              )}
              {message.authorName && (
                // No truncation: a long name wraps onto a second line rather
                // than being cut off mid-word.
                <p className="text-[11px] font-semibold leading-tight text-navy">
                  {message.authorName}
                </p>
              )}
            </div>
          )}
          <motion.div
            layout
            className={cn(
              "w-fit rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              // break-words: a message can be one unbroken string, which the
              // max-width alone cannot wrap.
              "whitespace-pre-wrap break-words",
              isUser
                ? "rounded-tr-md bg-primary text-white shadow-[0_8px_24px_-8px_rgba(20,77,200,0.5)]"
                : "rounded-tl-md border border-slate-200 bg-slate-50 text-slate-700",
            )}
            whileHover={{ scale: 1.01, y: -1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {message.content}
          </motion.div>
          {message.timestamp && (
            <p
              className={cn(
                "mt-1 px-1 text-[10px] text-slate-400",
                isUser && "text-right",
              )}
            >
              {message.timestamp}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ChatMessages({
  messages = DEFAULT_MESSAGES,
  autoPlay = true,
  autoPlayDelay = 1800,
  typingDuration = 1400,
  showReplay = true,
  interactive = false,
  className,
  title = "Nexus AI",
  subtitle = "Always here to help",
  headerIcon,
  footer,
  emptyState,
}: ChatMessagesProps) {
  const [visibleCount, setVisibleCount] = useState(
    autoPlay ? 0 : messages.length,
  );
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoPlaying = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const revealNext = useCallback(
    async (index: number) => {
      if (index >= chatMessages.length) {
        isAutoPlaying.current = false;
        return;
      }

      const message = chatMessages[index];

      if (message.sender === "assistant") {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, typingDuration));
        setIsTyping(false);
      }

      setVisibleCount(index + 1);
      await new Promise((r) => setTimeout(r, 100));
      scrollToBottom();

      await new Promise((r) =>
        setTimeout(
          r,
          autoPlayDelay -
            (message.sender === "assistant" ? typingDuration : 0) -
            100,
        ),
      );

      if (isAutoPlaying.current) {
        revealNext(index + 1);
      }
    },
    [chatMessages, autoPlayDelay, typingDuration, scrollToBottom],
  );

  const replay = useCallback(() => {
    setVisibleCount(0);
    setChatMessages(messages);
    isAutoPlaying.current = true;
    setTimeout(() => revealNext(0), 100);
  }, [messages, revealNext]);

  useEffect(() => {
    setChatMessages(messages);
    if (autoPlay) {
      setVisibleCount(0);
      isAutoPlaying.current = true;
      const timer = setTimeout(() => revealNext(0), 500);
      return () => {
        clearTimeout(timer);
        isAutoPlaying.current = false;
      };
    } else {
      setVisibleCount(messages.length);
    }
  }, [messages, autoPlay, revealNext]);

  useEffect(() => {
    scrollToBottom();
  }, [visibleCount, isTyping, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !interactive) return;

    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: inputValue.trim(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setVisibleCount((prev) => prev + 1);
  }, [inputValue, interactive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const visible = chatMessages.slice(0, visibleCount);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            {headerIcon ?? <Sparkles className="size-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {showReplay && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={replay}
            aria-label="Replay conversation"
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-200 hover:text-navy"
          >
            <RotateCcw className="size-3.5" />
            Replay
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {visible.length === 0 && emptyState}
        {visible.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3">
        {footer ?? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-primary">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!interactive}
              placeholder={
                interactive
                  ? "Ask Nexus AI..."
                  : "Demo mode - replay to watch again"
              }
              aria-label={
                interactive ? "Type your message" : "Chat input (demo mode)"
              }
              className="flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSend}
              disabled={!interactive || !inputValue.trim()}
              aria-label="Send message"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                interactive && inputValue.trim()
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "bg-slate-100 text-slate-300",
              )}
            >
              <Send className="size-4" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessages;
