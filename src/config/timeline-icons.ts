/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

/** Lucide dynamic icon names (kebab-case) for About timeline pickers. */
export const TIMELINE_ICON_OPTIONS = [
  "circle",
  "graduation-cap",
  "bot",
  "cpu",
  "sparkles",
  "smartphone",
  "code",
  "globe",
  "wifi",
  "radio",
  "arrow-up",
  "arrow-down",
  "brain-circuit",
  "book-open",
  "school",
  "wrench",
  "lightbulb",
  "rocket",
  "layers",
] as const

export type TimelineIconName = (typeof TIMELINE_ICON_OPTIONS)[number]
