// Skill color definitions for Notion-style colored tags
export const SKILL_COLORS = {
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-100',
    border: 'border-gray-200 dark:border-gray-700',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/50',
    text: 'text-red-800 dark:text-red-100',
    border: 'border-red-200 dark:border-red-800',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/50',
    text: 'text-orange-800 dark:text-orange-100',
    border: 'border-orange-200 dark:border-orange-800',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/50',
    text: 'text-yellow-800 dark:text-yellow-100',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/50',
    text: 'text-green-800 dark:text-green-100',
    border: 'border-green-200 dark:border-green-800',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    text: 'text-blue-800 dark:text-blue-100',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/50',
    text: 'text-purple-800 dark:text-purple-100',
    border: 'border-purple-200 dark:border-purple-800',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/50',
    text: 'text-pink-800 dark:text-pink-100',
    border: 'border-pink-200 dark:border-pink-800',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/50',
    text: 'text-teal-800 dark:text-teal-100',
    border: 'border-teal-200 dark:border-teal-800',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/50',
    text: 'text-indigo-800 dark:text-indigo-100',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  lime: {
    bg: 'bg-lime-100 dark:bg-lime-900/50',
    text: 'text-lime-800 dark:text-lime-100',
    border: 'border-lime-200 dark:border-lime-800',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-900/50',
    text: 'text-rose-800 dark:text-rose-100',
    border: 'border-rose-200 dark:border-rose-800',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    text: 'text-amber-800 dark:text-amber-100',
    border: 'border-amber-200 dark:border-amber-800',
  },
} as const;

export type SkillColor = keyof typeof SKILL_COLORS;

export function getSkillColorClasses(color: string = 'gray') {
  return SKILL_COLORS[color as SkillColor] || SKILL_COLORS.gray;
}
