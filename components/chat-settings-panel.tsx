"use client"

import { AppearanceTab } from "@/components/chat-settings-appearance-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ChatSettingsPanel() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
