/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import {
  SiAndroidstudio,
  SiArduino,
  SiKotlin,
  SiNextdotjs,
  SiReact,
  SiShadcnui,
  SiSwift,
  SiTailwindcss,
  SiVscodium,
  SiWebstorm,
  SiXcode,
} from "@icons-pack/react-simple-icons"

/** Map DB slug -> Simple Icon component. Extra aliases (e.g. swiftui) reuse the same icon. */
export const TECH_STACK_ICON_MAP = {
  kotlin: SiKotlin,
  swift: SiSwift,
  swiftui: SiSwift,
  xcode: SiXcode,
  androidstudio: SiAndroidstudio,
  nextdotjs: SiNextdotjs,
  react: SiReact,
  shadcnui: SiShadcnui,
  tailwindcss: SiTailwindcss,
  vscodium: SiVscodium,
  webstorm: SiWebstorm,
  arduino: SiArduino,
} as const

export type TechStackIconSlug = keyof typeof TECH_STACK_ICON_MAP

export const TECH_STACK_ICON_SLUGS = Object.keys(TECH_STACK_ICON_MAP) as TechStackIconSlug[]

export function isTechStackIconSlug(s: string): s is TechStackIconSlug {
  return s in TECH_STACK_ICON_MAP
}

export function getTechStackIcon(
  slug: string
): (typeof TECH_STACK_ICON_MAP)[TechStackIconSlug] | null {
  if (isTechStackIconSlug(slug)) return TECH_STACK_ICON_MAP[slug]
  return null
}
