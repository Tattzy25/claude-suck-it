"use client"

import { useEffect, useRef, useState } from "react"
import { RiSparkling2Fill } from "@remixicon/react"
import {
  ArrowUpIcon,
  CheckIcon,
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
import { useTheme } from "next-themes"
import { Image as ChatImage } from "@/components/image"
import { cn } from "@/lib/utils"

type MessageRole = "user" | "assistant"

type ChatPart =
  | { type: "text"; text: string }
  | { type: "image"; url: string; filename?: string }
  | { type: "tool"; label: string; status?: string }
  | { type: "approval"; id: string; label: string }

interface ChatMessage {
  id: number
  role: MessageRole
  parts: ChatPart[]
}

interface ComposerAttachment {
  id: number
  file: File
}

const initialMessages: ChatMessage[] = []

function parseAssistantParts(data: any): ChatPart[] {
  const parts: ChatPart[] = []

  const output = Array.isArray(data?.output) ? data.output : []

  for (const item of output) {
    if (!item || typeof item !== "object") continue

    if (item.type === "message" && Array.isArray(item.content)) {
      for (const contentItem of item.content) {
        if (!contentItem || typeof contentItem !== "object") continue

        if (
          contentItem.type === "output_text" &&
          typeof contentItem.text === "string" &&
          contentItem.text.trim()
        ) {
          parts.push({ type: "text", text: contentItem.text })
        }

        const imageUrl =
          (typeof contentItem.image_url === "string" && contentItem.image_url) ||
          (typeof contentItem.url === "string" && contentItem.url) ||
          (typeof contentItem.image === "string" && contentItem.image)

        if (
          (contentItem.type === "output_image" ||
            contentItem.type === "image" ||
            contentItem.type === "image_url") &&
          imageUrl
        ) {
          parts.push({
            type: "image",
            url: imageUrl,
            filename:
              typeof contentItem.filename === "string"
                ? contentItem.filename
                : undefined,
          })
        }
      }
    }

    if (
      item.type === "output_text" &&
      typeof item.text === "string" &&
      item.text.trim()
    ) {
      parts.push({ type: "text", text: item.text })
    }

    const itemImageUrl =
      (typeof item.image_url === "string" && item.image_url) ||
      (typeof item.url === "string" && item.url) ||
      (typeof item.image === "string" && item.image)

    if (
      (item.type === "output_image" ||
        item.type === "image" ||
        item.type === "image_url") &&
      itemImageUrl
    ) {
      parts.push({
        type: "image",
        url: itemImageUrl,
        filename: typeof item.filename === "string" ? item.filename : undefined,
      })
    }

    if (
      item.type === "image_generation_call" ||
      item.type === "web_search_call" ||
      item.type === "file_search_call" ||
      item.type === "mcp_call"
    ) {
      const status =
        typeof item.status === "string"
          ? item.status
          : typeof item.state === "string"
            ? item.state
            : undefined

      const label =
        item.type === "image_generation_call"
          ? "Generating image"
          : item.type === "web_search_call"
            ? "Searching web"
            : item.type === "file_search_call"
              ? "Searching knowledge"
              : "Running MCP tool"

      parts.push({ type: "tool", label, status })
    }

    if (item.type === "mcp_approval_request") {
      const approvalId =
        (typeof item.id === "string" && item.id) ||
        (typeof item.approval_id === "string" && item.approval_id) ||
        `approval-${Math.random().toString(36).slice(2, 10)}`

      const label =
        (typeof item.label === "string" && item.label) ||
        (typeof item.title === "string" && item.title) ||
        "Tool approval required"

      parts.push({ type: "approval", id: approvalId, label })
    }
  }

  if (parts.length === 0) {
    const fallbackText =
      (typeof data?.reply === "string" && data.reply.trim() && data.reply) ||
      (typeof data?.output_text === "string" &&
        data.output_text.trim() &&
        data.output_text) ||
      (typeof data?.text === "string" && data.text.trim() && data.text)

    if (fallbackText) {
      parts.push({ type: "text", text: fallbackText })
    }
  }

  return parts
}

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
      parts: [{ type: "text", text: trimmed || "Sent attachment" }],
    }
    setMessages((prev) => [...prev, userMessage])
    setDraft("")
    setAttachments([])
    setIsTyping(true)

    try {
      const firstImageAttachment = attachments.find((item) =>
        item.file.type.startsWith("image/")
      )

      const imageUrls: string[] = []

      if (firstImageAttachment) {
        const formData = new FormData()
        formData.append("file", firstImageAttachment.file)

        let uploadResponse: Response
        try {
          uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          })
        } catch {
            throw new Error("Failed to reach image upload service.")
        }

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text().catch(() => "")
          throw new Error(
            `Image upload failed (${uploadResponse.status})${errorText ? `: ${errorText}` : ""}`
          )
        }

        const uploadedRaw = await uploadResponse.text()

        let uploadedUrl = uploadedRaw.trim()
        try {
          const parsed = JSON.parse(uploadedRaw)
          if (typeof parsed === "string") {
            uploadedUrl = parsed
          } else if (typeof parsed?.url === "string") {
            uploadedUrl = parsed.url
          } else if (typeof parsed?.image_url === "string") {
            uploadedUrl = parsed.image_url
          } else if (typeof parsed?.image === "string") {
            uploadedUrl = parsed.image
          }
        } catch {
          // keep raw text value
        }

        imageUrls.push(uploadedUrl)
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          images: imageUrls,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data?.reply === "string" && data.reply.trim()
            ? data.reply
            : "Chat request failed"
        )
      }

      const payload = data?.response ?? data
      const assistantParts = parseAssistantParts(payload)

      if (assistantParts.length === 0) {
        throw new Error(
          typeof data?.reply === "string" && data.reply.trim()
            ? data.reply
            : "No assistant message parts returned"
        )
      }

      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "assistant", parts: assistantParts },
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chat request failed"
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          parts: [{ type: "text", text: message }],
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
                    TaTTTy
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-[var(--font-orbitron)] text-[14px] leading-none text-muted-foreground">
                    <span className="inline-block size-1.5 rounded-full bg-primary" />
                    {isTyping ? "Responding…" : "Connected"}
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
                                  <BubbleContent className="space-y-2 text-xs whitespace-pre-line sm:text-sm">
                                    {msg.parts.map((part, idx) => {
                                      if (part.type === "text") {
                                        return <p key={idx}>{part.text}</p>
                                      }

                                      if (part.type === "image") {
                                        return (
                                          <div key={idx} className="max-w-64">
                                            <ChatImage.Root>
                                              <ChatImage.Zoom
                                                src={part.url}
                                                alt={part.filename || "Generated image"}
                                              >
                                                <ChatImage.Preview
                                                  src={part.url}
                                                  alt={part.filename || "Generated image"}
                                                />
                                              </ChatImage.Zoom>
                                              <ChatImage.Filename>
                                                {part.filename}
                                              </ChatImage.Filename>
                                            </ChatImage.Root>
                                          </div>
                                        )
                                      }

                                      if (part.type === "tool") {
                                        return (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] sm:text-xs"
                                          >
                                            <span className="inline-block size-1.5 rounded-full bg-primary" />
                                            <span>{part.label}</span>
                                            {part.status && (
                                              <span className="text-muted-foreground">
                                                ({part.status})
                                              </span>
                                            )}
                                          </div>
                                        )
                                      }

                                      if (part.type === "approval") {
                                        return (
                                          <div
                                            key={idx}
                                            className="space-y-2 rounded-md border border-border bg-background/80 p-2"
                                          >
                                            <p className="text-[11px] sm:text-xs">
                                              {part.label}
                                            </p>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="default"
                                                className="h-7 px-2 text-[11px]"
                                              >
                                                <CheckIcon className="mr-1 size-3" />
                                                Approve
                                              </Button>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-2 text-[11px]"
                                              >
                                                Deny
                                              </Button>
                                            </div>
                                          </div>
                                        )
                                      }

                                      return null
                                    })}
                                  </BubbleContent>
                                </Bubble>
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      ))}

                      {isTyping && (
                        <Marker role="status">
                          <MarkerContent className="shimmer">
                            Agent Sold is typing...
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
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
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
                          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
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
