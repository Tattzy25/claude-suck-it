"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type ChatSettingsState = {
  bubbleSize: number
  panelWidth: number
  panelHeight: number
  darkMode: boolean
}

export const DEFAULT_CHAT_SETTINGS: ChatSettingsState = {
  bubbleSize: 56,
  panelWidth: 384,
  panelHeight: 560,
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
