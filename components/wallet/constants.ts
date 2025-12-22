// Constants for the wallet module

export const PRESET_COLORS = [
  "#00ff41", 
  "#00d9ff", 
  "#a855f7", 
  "#ffaa00", 
  "#ff6b35", 
  "#00ffff", 
  "#ff1493", 
  "#7fff00"
] as const

export type PresetColor = typeof PRESET_COLORS[number]

