"use client"

import { useChatSettings } from "@/components/chat-settings"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

function SettingRow({
  label,
  value,
  unit = "px",
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  unit?: string
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}

export function AppearanceTab() {
  const { settings, setSettings } = useChatSettings()

  return (
    <div className="grid gap-5 pt-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm">Chat dark mode</span>
        <Switch
          checked={settings.darkMode}
          onCheckedChange={(darkMode) => setSettings({ darkMode })}
        />
      </div>
      <SettingRow
        label="Bubble size"
        value={settings.bubbleSize}
        min={40}
        max={88}
        onChange={(bubbleSize) => setSettings({ bubbleSize })}
      />
      <SettingRow
        label="Chat width"
        value={settings.panelWidth}
        min={0}
        max={480}
        onChange={(panelWidth) => setSettings({ panelWidth })}
      />
      <SettingRow
        label="Chat height"
        value={settings.panelHeight}
        min={0}
        max={720}
        onChange={(panelHeight) => setSettings({ panelHeight })}
      />
    </div>
  )
}
