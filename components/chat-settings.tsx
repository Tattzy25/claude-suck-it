"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { ActivityIcon } from "@/components/ui/activity"
import { AtSignIcon } from "@/components/ui/at-sign"
import { BotMessageSquareIcon } from "@/components/ui/bot-message-square"
import { MessageCircleDashedIcon } from "@/components/ui/message-circle-dashed"
import { MessageCircleXIcon } from "@/components/ui/message-circle-x"
import { MessageSquareIcon } from "@/components/ui/message-square"
import { MessageSquareXIcon } from "@/components/ui/message-square-x"
import { SendIcon } from "@/components/ui/send"

export const BUBBLE_ICONS = {
  "bot-message-square": BotMessageSquareIcon,
  "message-circle-dashed": MessageCircleDashedIcon,
  "message-square-x": MessageSquareXIcon,
  "message-square": MessageSquareIcon,
  send: SendIcon,
  activity: ActivityIcon,
  "at-sign": AtSignIcon,
  "message-circle-x": MessageCircleXIcon,
}

export type BubbleIconKey = keyof typeof BUBBLE_ICONS

export type ChatSettingsState = {
  bubbleSize: number
  panelWidth: number
  panelHeight: number
  bubbleIcon: BubbleIconKey
  darkMode: boolean
}

export const DEFAULT_CHAT_SETTINGS: ChatSettingsState = {
  bubbleSize: 56,
  panelWidth: 384,
  panelHeight: 560,
  bubbleIcon: "bot-message-square",
  darkMode: false,
}

type ChatSettingsContextValue = {
  settings: ChatSettingsState
  setSettings: (update: Partial<ChatSettingsState>) => void
}

const ChatSettingsContext = createContext<ChatSettingsContextValue | null>(null)

export function ChatSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<ChatSettingsState>(
    DEFAULT_CHAT_SETTINGS
  )

  const setSettings = (update: Partial<ChatSettingsState>) => {
    setSettingsState((prev) => ({ ...prev, ...update }))
  }

  return (
    <ChatSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </ChatSettingsContext.Provider>
  )
}

export function useChatSettings() {
  const context = useContext(ChatSettingsContext)
  if (!context) {
    throw new Error("useChatSettings must be used within a ChatSettingsProvider")
  }
  return context
}
