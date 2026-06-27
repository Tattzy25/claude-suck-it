"use client"

import { useEffect, useRef, useState } from "react"
import { RiSparkling2Fill } from "@remixicon/react"
import {
  ArrowUpIcon,
  GlobeIcon,
  ImageIcon,
  PaperclipIcon,
  PlusIcon,
  TelescopeIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type MessageRole = "user" | "assistant"

interface ChatMessage {
  id: number
  role: MessageRole
  content: string
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi, I'm Acme Copilot. Ask me to draft, summarise, or plan something and I'll get to work.",
  },
  {
    id: 2,
    role: "user",
    content: "What can you help me with on the Acme dashboard?",
  },
  {
    id: 3,
    role: "assistant",
    content:
      "Plenty. I can surface revenue trends, draft customer replies, generate release notes, and explain any metric you click on. Want me to start with a quick weekly summary?",
  },
]

const cannedReplies: string[] = [
  "Got it. Here's a quick take: your weekly active users are up 12% and trial conversion held steady at 4.8%. Want me to break this down by plan tier?",
  "Done. I drafted three subject-line variants and a 90-word body for the launch email, each tuned for a slightly different audience. I can refine the tone if you'd like.",
  "Sure thing. The top driver this week was the Acme Pro upgrade flow (+$18.4k). I can pull the full attribution report whenever you're ready.",
  "Here's a starting outline with five sections and suggested owners. Let me know which part you'd like me to expand first.",
]

const suggestions: string[] = [
  "Summarise This Week",
  "Draft a Launch Email",
  "Explain Churn Rate",
]

export default function AiChatBlock() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const replyIndex = useRef(0)
  const nextId = useRef(initialMessages.length + 1)
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const timers = replyTimers.current
    return () => timers.forEach(clearTimeout)
  }, [])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])
    setDraft("")
    setIsTyping(true)

    const reply = cannedReplies[replyIndex.current % cannedReplies.length]
    replyIndex.current += 1

    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "assistant", content: reply },
      ])
      setIsTyping(false)
    }, 1400)
    replyTimers.current.push(timer)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    send(draft)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      send(draft)
    }
  }

  return (
    <section className="flex min-h-svh w-full items-center justify-center bg-muted/30 px-6 py-16 text-foreground">
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <Card className="flex h-[80vh] max-h-[640px] w-full max-w-2xl flex-col overflow-hidden border border-border shadow-sm">
          <CardHeader className="px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                <RiSparkling2Fill className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm leading-none font-semibold tracking-tight">
                  Acme Copilot
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block size-1.5 rounded-full bg-primary" />
                  {isTyping ? "Typing…" : "Online"}
                </span>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
            <MessageScroller className="size-full">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-5 px-5 py-5">
                  {messages.map((msg) => (
                    <MessageScrollerItem
                      key={msg.id}
                      messageId={String(msg.id)}
                      scrollAnchor={msg.role === "user"}
                    >
                      <Message align={msg.role === "user" ? "end" : "start"}>
                        <MessageAvatar>
                          <Avatar className="size-8 border border-border">
                            {msg.role === "user" ? (
                              <>
                                <AvatarImage
                                  src="https://i.pravatar.cc/150?img=12"
                                  alt="You"
                                  className="grayscale"
                                />
                                <AvatarFallback className="text-xs font-medium">
                                  JD
                                </AvatarFallback>
                              </>
                            ) : (
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <RiSparkling2Fill
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </MessageAvatar>
                        <MessageContent>
                          <Bubble
                            variant={msg.role === "user" ? "default" : "muted"}
                          >
                            <BubbleContent className="text-sm whitespace-pre-line">
                              {msg.content}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}

                  {isTyping && (
                    <Marker role="status">
                      <MarkerContent className="shimmer">
                        Acme Copilot is typing...
                      </MarkerContent>
                    </Marker>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 px-5 py-4">
            <form onSubmit={handleSubmit} className="w-full">
              <InputGroup>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Message Acme Copilot…"
                  aria-label="Message Acme Copilot"
                  className="max-h-28 min-h-14 resize-none border-0 bg-transparent px-3 py-2.5 text-sm shadow-none focus-visible:ring-0"
                />
                <InputGroupAddon align="block-end" className="pt-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <InputGroupButton
                        aria-label="Add files"
                        type="button"
                        size="icon-sm"
                        variant="outline"
                      >
                        <PlusIcon />
                      </InputGroupButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="top"
                      className="w-44"
                    >
                      <DropdownMenuItem>
                        <PaperclipIcon />
                        Add Photos & Files
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <ImageIcon />
                        Create Image
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TelescopeIcon />
                        Deep Research
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <GlobeIcon />
                        Web Search
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={!draft.trim() || isTyping}
                    className="ml-auto"
                    aria-label="Send message"
                  >
                    <ArrowUpIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardFooter>
        </Card>
      </MessageScrollerProvider>
    </section>
  )
}
