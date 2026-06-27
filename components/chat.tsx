"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircleIcon, XIcon } from "lucide-react"

import { useChatSettings } from "@/components/chat-settings"
import AiChatBlock from "@/components/ai-chat-block"
import { Button } from "@/components/ui/button"

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
            ? "absolute bottom-[calc(100%+0.75rem)] left-0 overflow-hidden rounded-xl"
            : zone === "right"
              ? "absolute bottom-[calc(100%+0.75rem)] right-0 overflow-hidden rounded-xl"
              : "absolute bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 overflow-hidden rounded-xl"
        }
        style={{
          width:
            panelMaxWidth !== undefined
              ? Math.min(panelMaxWidth, settings.panelWidth)
              : settings.panelWidth,
        }}
      >
        <AiChatBlock />
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
          <MessageCircleIcon style={{ width: settings.bubbleSize * 0.4, height: settings.bubbleSize * 0.4 }} />
        )}
      </Button>
    </div>
  )
}
