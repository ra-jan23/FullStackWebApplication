import {
  Trophy, Target, Swords, Zap, Flame, Star, Crown, Shield, Award, Medal,
  Rocket, Diamond, Compass, Hexagon, CircleDot, Sunrise, Activity,
  Infinity, Sparkles, Wind, type LucideIcon,
} from "lucide-react";

export interface AvatarOption {
  id: string;
  from: string;
  to: string;
  icon: LucideIcon;
  label: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "trophy", from: "from-amber-500", to: "to-yellow-600", icon: Trophy, label: "Trophy" },
  { id: "target", from: "from-red-500", to: "to-rose-600", icon: Target, label: "Target" },
  { id: "swords", from: "from-violet-500", to: "to-purple-600", icon: Swords, label: "Swords" },
  { id: "zap", from: "from-cyan-500", to: "to-blue-600", icon: Zap, label: "Lightning" },
  { id: "flame", from: "from-orange-500", to: "to-red-500", icon: Flame, label: "Flame" },
  { id: "star", from: "from-emerald-500", to: "to-teal-600", icon: Star, label: "Star" },
  { id: "crown", from: "from-yellow-500", to: "to-amber-600", icon: Crown, label: "Crown" },
  { id: "shield", from: "from-slate-600", to: "to-gray-700", icon: Shield, label: "Shield" },
  { id: "award", from: "from-pink-500", to: "to-rose-500", icon: Award, label: "Award" },
  { id: "medal", from: "from-lime-500", to: "to-green-600", icon: Medal, label: "Medal" },
  { id: "rocket", from: "from-sky-500", to: "to-blue-600", icon: Rocket, label: "Rocket" },
  { id: "diamond", from: "from-fuchsia-500", to: "to-pink-600", icon: Diamond, label: "Diamond" },
  { id: "compass", from: "from-teal-500", to: "to-emerald-600", icon: Compass, label: "Compass" },
  { id: "hexagon", from: "from-indigo-500", to: "to-violet-600", icon: Hexagon, label: "Hexagon" },
  { id: "circle-dot", from: "from-green-500", to: "to-emerald-700", icon: CircleDot, label: "Football" },
  { id: "sunrise", from: "from-orange-400", to: "to-pink-500", icon: Sunrise, label: "Sunrise" },
  { id: "activity", from: "from-red-400", to: "to-orange-500", icon: Activity, label: "Activity" },
  { id: "infinity", from: "from-purple-500", to: "to-indigo-600", icon: Infinity, label: "Infinity" },
  { id: "sparkles", from: "from-amber-400", to: "to-yellow-500", icon: Sparkles, label: "Sparkles" },
  { id: "wind", from: "from-sky-400", to: "to-cyan-500", icon: Wind, label: "Wind" },
];

export function getAvatarOption(id: string | null | undefined): AvatarOption | null {
  if (!id) return null;
  return AVATAR_OPTIONS.find((a) => a.id === id) ?? null;
}
