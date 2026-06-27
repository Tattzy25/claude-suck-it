import { Card } from "@/components/ui/card"
import { MessageScrollerDemo } from "@/components/chat"

export default function Home() {
  return (
    <div className="flex h-screen w-screen" style={{ gap: "20px", padding: "20px" }}>
      <Card className="flex-1" />
      <Card className="flex-1">
        <MessageScrollerDemo />
      </Card>
    </div>
  )
}