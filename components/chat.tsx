"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import {
  ArrowUpIcon,
  GlobeIcon,
  ImageIcon,
  MessageCircleDashedIcon,
  PaperclipIcon,
  PlusIcon,
  RotateCwIcon,
  TelescopeIcon,
  XIcon,
} from "lucide-react"

import { createChat, getMessageText } from "@/lib/ai"
import { BUBBLE_ICONS, useChatSettings } from "@/components/chat-settings"
import { MessageAnimated } from "@/components/message-animated"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const chat = createChat()
  .user(
    "I'm building a chat for our app and the scroll behavior is driving me nuts. Every time the AI streams a reply, the whole thread jumps around."
  )
  .sleep(1000)
  .assistant(
    "That's the classic streaming scroll problem. Wrap your message list in `MessageScroller` and turn on `autoScroll` — the viewport pins to the bottom as tokens arrive, so users always see the latest text land in place.\n\nThe important part: it only auto-scrolls while the reader is already at the bottom. The moment they scroll up to read something earlier, auto-scroll backs off and their position is preserved. You get smooth streaming without fighting the user's intent."
  )
  .user(
    "Okay, but when someone sends a new message the view still feels jarring — like the whole conversation reloads from the top."
  )
  .sleep(1000)
  .assistant(
    "MessageScrollerItem fixes that with turn anchoring. Set `scrollAnchor` on the turn that should settle near the top instead of blindly snapping to the document bottom.\n\nIt also leaves a small peek of the previous exchange visible above the anchor, so context isn't lost. The reply starts in view without that disorienting jump you get from a plain overflow container."
  )
  .user(
    "And if they've scrolled up to re-read an older answer? I don't want to yank them back down."
  )
  .sleep(1000)
  .assistant(
    "You won't. Auto-scroll only runs when the viewport is already pinned to the bottom, so scrolling up is a deliberate opt-out — their place in the thread stays put even as new tokens keep arriving below.\n\nWhen there is content they haven't seen yet, `MessageScrollerButton` appears at the bottom of the viewport. One tap jumps them back to the newest message and re-engages auto-scroll. Same pattern as Slack or iMessage: quiet when you're caught up, helpful when you're not."
  )
  .user("Last one — does this work with assistive tech?")
  .sleep(1000)
  .assistant(
    '`MessageScrollerContent` sets `role="log"` and `aria-relevant="additions"` by default, so screen readers announce new messages as they stream in.\n\nThe scroll button is a real `<button>` with an sr-only label, and it\'s removed from the tab order when you\'re already at the bottom — no ghost focus stops.'
  )
const initialMessages = chat.get({ count: 0 })
const transport = chat.transport({ chunkDelayMs: 20 })

const WRAPPER_MARGIN = 16
const PANEL_GAP = 12

export function MessageScrollerDemo() {
  const { settings } = useChatSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [zone, setZone] = useState<"left" | "middle" | "right">("right")
  const [containerSize, setContainerSize] = useState<{
    width: number
    height: number
  } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const draggedRef = useRef(false)
  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initialMessages,
    transport,
  })
  const nextMessage = chat.next({ after: messages })
  const isBusy = status === "submitted" || status === "streaming"
  const BubbleIcon = BUBBLE_ICONS[settings.bubbleIcon]

  useEffect(() => {
    const container = wrapperRef.current?.offsetParent
    if (!(container instanceof HTMLElement)) {
      return
    }
    const updateSize = () =>
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const panelMaxHeight = containerSize
    ? containerSize.height -
      WRAPPER_MARGIN * 2 -
      settings.bubbleSize -
      PANEL_GAP
    : undefined
  const panelMaxWidth = containerSize
    ? containerSize.width - WRAPPER_MARGIN * 2
    : undefined

  const handleBubblePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggedRef.current = false
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    }
  }

  const handleBubblePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current
    const wrapper = wrapperRef.current
    if (!drag || !wrapper) {
      return
    }
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      draggedRef.current = true
    }

    let nextX = drag.originX + dx
    let nextY = drag.originY + dy

    const container = wrapper.offsetParent
    if (container instanceof HTMLElement) {
      const minX = -wrapper.offsetLeft
      const maxX = container.clientWidth - wrapper.offsetLeft - wrapper.offsetWidth
      const minY = -wrapper.offsetTop
      const maxY = container.clientHeight - wrapper.offsetTop - wrapper.offsetHeight
      nextX = Math.min(Math.max(nextX, minX), maxX)
      nextY = Math.min(Math.max(nextY, minY), maxY)

      const bubbleCenterX = wrapper.offsetLeft + nextX + wrapper.offsetWidth / 2
      const third = container.clientWidth / 3
      if (bubbleCenterX < third) {
        setZone("left")
      } else if (bubbleCenterX > third * 2) {
        setZone("right")
      } else {
        setZone("middle")
      }
    }

    setPosition({ x: nextX, y: nextY })
  }

  const handleBubblePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    dragStateRef.current = null
  }

  const handleBubbleClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false
      return
    }
    setIsOpen((open) => !open)
  }

  return (
    <MessageScrollerProvider>
      <div
        ref={wrapperRef}
        className={
          settings.darkMode
            ? "dark absolute right-4 bottom-4 z-50"
            : "absolute right-4 bottom-4 z-50"
        }
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        {isOpen && (
        <div
          className={
            zone === "left"
              ? "absolute bottom-[calc(100%+0.75rem)] left-0 flex flex-col gap-2"
              : zone === "right"
                ? "absolute bottom-[calc(100%+0.75rem)] right-0 flex flex-col gap-2"
                : "absolute bottom-[calc(100%+0.75rem)] left-1/2 flex flex-col -translate-x-1/2 gap-2"
          }
          style={{
            width:
              panelMaxWidth !== undefined
                ? Math.min(panelMaxWidth, settings.panelWidth)
                : settings.panelWidth,
          }}
        >
        <Card
          className="w-full gap-0"
          style={{
            height:
              panelMaxHeight !== undefined
                ? Math.min(panelMaxHeight, settings.panelHeight)
                : settings.panelHeight,
          }}
        >
          <CardHeader className="gap-1 border-b">
            <CardTitle>New Chat</CardTitle>
            <CardDescription>How can I help you today?</CardDescription>
            <CardAction>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Reset conversation"
                    onClick={() => setMessages(initialMessages)}
                    disabled={isBusy}
                  >
                    <RotateCwIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset</p>
                </TooltipContent>
              </Tooltip>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {messages.length === 0 ? (
              <Empty className="h-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageCircleDashedIcon />
                  </EmptyMedia>
                  <EmptyTitle>Morning, shadcn!</EmptyTitle>
                  <EmptyDescription>
                    What are we working on today? Press send to start a new
                    conversation
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent
                    aria-busy={isBusy}
                    className="p-(--card-spacing)"
                  >
                    {messages.map((message) => (
                      <MessageAnimated
                        key={message.id}
                        message={message}
                        scrollAnchor={message.role === "user"}
                      />
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!nextMessage || isBusy) {
                  return
                }
                void sendMessage(nextMessage)
              }}
              className="w-full"
            >
              <InputGroup>
                <div className="h-14 w-full px-3 py-2.5">
                  <span
                    className="line-clamp-2 opacity-60 data-[status=ready]:opacity-100"
                    data-status={status}
                  >
                    {nextMessage ? (
                      getMessageText(nextMessage)
                    ) : (
                      <span className="text-muted-foreground">
                        No messages queued. Reset the conversation.
                      </span>
                    )}
                  </span>
                </div>
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
                    disabled={!nextMessage || isBusy}
                    className="ml-auto"
                  >
                    <ArrowUpIcon />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardFooter>
        </Card>
        </div>
        )}
        <Button
          type="button"
          size="icon"
          className="cursor-grab touch-none rounded-full shadow-lg active:cursor-grabbing"
          style={{ width: settings.bubbleSize, height: settings.bubbleSize }}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          onPointerDown={handleBubblePointerDown}
          onPointerMove={handleBubblePointerMove}
          onPointerUp={handleBubblePointerUp}
          onPointerCancel={handleBubblePointerUp}
          onClick={handleBubbleClick}
        >
          {isOpen ? (
            <XIcon style={{ width: settings.bubbleSize * 0.4, height: settings.bubbleSize * 0.4 }} />
          ) : (
            <BubbleIcon size={settings.bubbleSize * 0.4} />
          )}
        </Button>
      </div>
    </MessageScrollerProvider>
  )
}
