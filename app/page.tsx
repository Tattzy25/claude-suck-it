import { ChatSettingsProvider } from "@/components/chat-settings"
import { ChatSettingsPanel } from "@/components/chat-settings-panel"
import { Card } from "@/components/ui/card"
import { MessageScrollerDemo } from "@/components/chat"

export default function Home() {
  return (
    <ChatSettingsProvider>
      <div className="flex h-screen w-screen" style={{ gap: "20px", padding: "20px" }}>
        <Card className="flex-1">
          <ChatSettingsPanel />
        </Card>
        <Card className="relative flex-1">
          <MessageScrollerDemo />
        </Card>
      </div>
    </ChatSettingsProvider>
  )
}