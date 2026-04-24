/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

"use client"

import { DynamicIcon, type IconName } from "lucide-react/dynamic"

export function TimelineDynamicIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const safe = (name || "circle").replace(/_/g, "-") as IconName
  return <DynamicIcon name={safe} className={className} />
}
