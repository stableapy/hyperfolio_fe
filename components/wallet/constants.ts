// Constants for the wallet module

export const PRESET_COLORS = [
  "#00ff41", 
  "#ffb000", 
  "#b4ff00", 
  "#ffaa00", 
  "#ff6b35", 
  "#ff1493", 
  "#7fff00",
  "#ff4444"
] as const

export type PresetColor = typeof PRESET_COLORS[number]

