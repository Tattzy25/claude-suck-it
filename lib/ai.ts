import type { ChatTransport, UIMessage, UIMessageChunk } from "ai"

type ScriptedStep = {
  role: "user" | "assistant"
  text: string
  delayMs: number
}

class ScriptedChat {
  private steps: ScriptedStep[] = []
  private pendingDelay = 0

  user(text: string) {
    this.steps.push({ role: "user", text, delayMs: 0 })
    return this
  }

  assistant(text: string) {
    this.steps.push({ role: "assistant", text, delayMs: this.pendingDelay })
    this.pendingDelay = 0
    return this
  }

  sleep(ms: number) {
    this.pendingDelay = ms
    return this
  }

  private toMessage(step: ScriptedStep, index: number): UIMessage {
    return {
      id: `scripted-${index}`,
      role: step.role,
      parts: [{ type: "text", text: step.text }],
    }
  }

  get({ count }: { count: number }): UIMessage[] {
    return this.steps.slice(0, count).map((step, index) => this.toMessage(step, index))
  }

  next({ after }: { after: UIMessage[] }): { text: string } | undefined {
    const step = this.steps[after.length]
    if (!step || step.role !== "user") {
      return undefined
    }
    return { text: step.text }
  }

  transport({ chunkDelayMs }: { chunkDelayMs: number }): ChatTransport<UIMessage> {
    const steps = this.steps

    return {
      async sendMessages({ messages }) {
        const index = messages.length
        const step = steps[index]

        return new ReadableStream<UIMessageChunk>({
          async start(controller) {
            if (!step || step.role !== "assistant") {
              controller.close()
              return
            }

            if (step.delayMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, step.delayMs))
            }

            const messageId = `scripted-${index}`
            const textId = `${messageId}-text`

            controller.enqueue({ type: "start", messageId })
            controller.enqueue({ type: "text-start", id: textId })

            const chunkSize = 3
            for (let i = 0; i < step.text.length; i += chunkSize) {
              controller.enqueue({
                type: "text-delta",
                id: textId,
                delta: step.text.slice(i, i + chunkSize),
              })
              await new Promise((resolve) => setTimeout(resolve, chunkDelayMs))
            }

            controller.enqueue({ type: "text-end", id: textId })
            controller.enqueue({ type: "finish" })
            controller.close()
          },
        })
      },
      async reconnectToStream() {
        return null
      },
    }
  }
}

export function createChat() {
  return new ScriptedChat()
}

export function getMessageText(message: UIMessage | { text: string }): string {
  if ("text" in message) {
    return message.text
  }
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}
