import { useTheme } from "next-themes"
import { Switch } from "./ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Switch
      checked={theme === "dark"}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
    />
  )
}