"use client"

import type { UIMessage } from "ai"

import { getMessageText } from "@/lib/ai"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"
import { MessageScrollerItem } from "@/components/ui/message-scroller"

type BubbleVariant = React.ComponentProps<typeof Bubble>["variant"]

export function MessageAnimated({
  message,
  scrollAnchor = false,
  userVariant = "default",
  assistantVariant = "ghost",
}: {
  message: UIMessage
  scrollAnchor?: boolean
  userVariant?: BubbleVariant
  assistantVariant?: BubbleVariant
}) {
  const isUser = message.role === "user"

  return (
    <MessageScrollerItem messageId={message.id} scrollAnchor={scrollAnchor}>
      <Message align={isUser ? "end" : "start"}>
        <MessageContent>
          <Bubble variant={isUser ? userVariant : assistantVariant} align={isUser ? "end" : "start"}>
            <BubbleContent>{getMessageText(message)}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}
