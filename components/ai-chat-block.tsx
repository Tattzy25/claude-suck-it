"use client"

import { useEffect, useRef, useState } from "react"
import { RiSparkling2Fill } from "@remixicon/react"
import {
  ArrowUpIcon,
  FileIcon,
  GlobeIcon,
  ImageIcon,
  MoonIcon,
  PaperclipIcon,
  PlusIcon,
  SunIcon,
  TelescopeIcon,
  XIcon,
} from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
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
import TextareaAutosize from "react-textarea-autosize"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

type MessageRole = "user" | "assistant"

interface ChatMessage {
  id: number
  role: MessageRole
  content: string
}

interface ComposerAttachment {
  id: number
  file: File
}

const initialMessages: ChatMessage[] = []

export default function AiChatBlock() {
  const { setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
  const nextId = useRef(1)
  const nextAttachmentId = useRef(1)
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timers = replyTimers.current
    return () => timers.forEach(clearTimeout)
  }, [])

  async function send(text: string) {
    const trimmed = text.trim()
    if (isTyping || (!trimmed && attachments.length === 0)) return

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      content: trimmed || "Sent attachment",
    }
    setMessages((prev) => [...prev, userMessage])
    setDraft("")
    setAttachments([])
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await response.json().catch(() => null)
      const assistantContent =
        (typeof data?.reply === "string" && data.reply) ||
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.content === "string" && data.content) ||
        "No response from server."

      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "assistant", content: assistantContent },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          content: "Request failed. Please try again.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
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

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) return

    setAttachments((prev) => [
      ...prev,
      ...selectedFiles.map((file) => ({
        id: nextAttachmentId.current++,
        file,
      })),
    ])

    event.target.value = ""
  }

  function removeAttachment(id: number) {
    setAttachments((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <section className="pointer-events-none fixed right-3 bottom-3 z-50 sm:right-4 sm:bottom-4 md:right-6 md:bottom-6">
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <div className="flex flex-col items-end gap-3">
          {isOpen && (
            <Card className="pointer-events-auto flex h-[70svh] max-h-[760px] w-[calc(100vw-1.5rem)] max-w-[420px] flex-col gap-0 overflow-hidden border border-border px-0 pt-[10px] pb-0 shadow-xl sm:h-[75svh] sm:w-[380px]">
              <CardHeader className="px-3 pt-[0.6rem] pb-0 sm:px-4 sm:pt-[0.7rem] sm:pb-0 md:px-5 md:pt-[0.8rem] md:pb-0">
                <div className="flex items-center gap-3 leading-none -translate-y-[5px]">
                  <span className="flex size-7 shrink-0 items-center justify-center overflow-visible pb-[1px] bg-primary text-primary-foreground">
                    <RiSparkling2Fill className="size-3.5 translate-y-[0.5px]" aria-hidden="true" />
                  </span>
                  <span className="font-[var(--font-orbitron)] text-[16px] leading-none font-semibold tracking-tight">
                    Acme Copilot
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-[var(--font-orbitron)] text-[14px] leading-none text-muted-foreground">
                    <span className="inline-block size-1.5 rounded-full bg-primary" />
                    {isTyping ? "Typing…" : "Online"}
                  </span>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
                <MessageScroller className="size-full">
                  <MessageScrollerViewport>
                    <MessageScrollerContent className="gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-5 md:py-5">
                      {messages.map((msg) => (
                        <MessageScrollerItem
                          key={msg.id}
                          messageId={String(msg.id)}
                          scrollAnchor={msg.role === "user"}
                        >
                          <Message align={msg.role === "user" ? "end" : "start"}>
                            <MessageAvatar>
                              <Avatar className="size-7 border border-border sm:size-8">
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
                                <BubbleContent className="text-xs whitespace-pre-line sm:text-sm">
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
                            Agent Gold is typing...
                          </MarkerContent>
                        </Marker>
                      )}
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton />
                </MessageScroller>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4">
                <form onSubmit={handleSubmit} className="w-full space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                    aria-label="Attach files"
                  />

                  {attachments.length > 0 && (
                    <AttachmentGroup className="w-full">
                      {attachments.map((item) => (
                        <Attachment key={item.id} size="sm" className="w-64">
                          <AttachmentMedia>
                            <FileIcon />
                          </AttachmentMedia>
                          <AttachmentContent>
                            <AttachmentTitle>{item.file.name}</AttachmentTitle>
                            <AttachmentDescription>
                              {item.file.type || "File"} · {formatBytes(item.file.size)}
                            </AttachmentDescription>
                          </AttachmentContent>
                          <AttachmentActions>
                            <AttachmentAction
                              type="button"
                              aria-label={`Remove ${item.file.name}`}
                              onClick={() => removeAttachment(item.id)}
                            >
                              <XIcon />
                            </AttachmentAction>
                          </AttachmentActions>
                        </Attachment>
                      ))}
                    </AttachmentGroup>
                  )}

                  <InputGroup className="has-disabled:bg-transparent has-disabled:opacity-100 dark:has-disabled:bg-transparent">
                    <InputGroupAddon align="inline-start">
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
                          className="w-40 sm:w-44"
                        >
                          <DropdownMenuItem
                            onClick={() => fileInputRef.current?.click()}
                          >
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
                          <DropdownMenuItem onClick={() => setTheme("light")}>
                            <SunIcon />
                            Light
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <MoonIcon />
                            Dark
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </InputGroupAddon>
                    <TextareaAutosize
                      data-slot="input-group-control"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      minRows={1}
                      maxRows={6}
                      placeholder="Type a message…"
                      aria-label="Type a message"
                      className="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="submit"
                        variant="default"
                        size="icon-sm"
                        className="ml-auto disabled:opacity-100"
                        aria-label="Send message"
                      >
                        <ArrowUpIcon />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </form>
              </CardFooter>
            </Card>
          )}

          <Button
            type="button"
            size="icon"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close chat widget" : "Open chat widget"}
            className={cn(
              "pointer-events-auto h-14 w-14 rounded-full shadow-lg",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isOpen ? (
              <XIcon className="size-6" aria-hidden="true" />
            ) : (
              <RiSparkling2Fill className="size-6" aria-hidden="true" />
            )}
          </Button>
        </div>
      </MessageScrollerProvider>
    </section>
  )
}
