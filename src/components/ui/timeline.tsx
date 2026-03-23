/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const timelineVariants = cva("flex flex-col relative", {
  variants: {
    size: {
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type TimelineColor = "primary" | "secondary" | "muted" | "accent" | "destructive"

interface TimelineProps
  extends React.HTMLAttributes<HTMLOListElement>,
    VariantProps<typeof timelineVariants> {
  iconsize?: "sm" | "md" | "lg"
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, iconsize, size, children, ...props }, ref) => {
    const items = React.Children.toArray(children)
    if (items.length === 0) {
      return (
        <ol
          ref={ref}
          className={cn(
            "flex flex-col items-center justify-center p-8 text-center",
            className
          )}
        >
          <p className="text-sm text-muted-foreground">
            No timeline items to display
          </p>
        </ol>
      )
    }
    return (
      <ol
        ref={ref}
        aria-label="Timeline"
        className={cn(
          timelineVariants({ size }),
          "relative w-full max-w-2xl py-4",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (
            React.isValidElement(child) &&
            typeof child.type !== "string" &&
            "displayName" in child.type &&
            child.type.displayName === "TimelineItem"
          ) {
            return React.cloneElement(child, {
              iconsize,
              showConnector: index !== items.length - 1,
            } as React.ComponentProps<typeof TimelineItem>)
          }
          return child
        })}
      </ol>
    )
  }
)
Timeline.displayName = "Timeline"

interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  date?: string | Date | number
  title?: string
  description?: string
  icon?: React.ReactNode
  iconColor?: TimelineColor
  status?: "completed" | "in-progress" | "pending"
  showConnector?: boolean
  iconsize?: "sm" | "md" | "lg"
}

function formatTimelineDate(date?: string | Date | number): string {
  if (!date) return ""
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ""
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d)
  } catch {
    return ""
  }
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  (
    {
      className,
      date,
      title,
      description,
      icon,
      iconColor = "primary",
      status = "completed",
      showConnector = true,
      iconsize = "md",
      ...props
    },
    ref
  ) => {
    const sizeClasses = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" }
    const iconSizeClasses = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }
    const colorClasses: Record<TimelineColor, string> = {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      muted: "bg-muted text-muted-foreground",
      accent: "bg-accent text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    }
    return (
      <li
        ref={ref}
        className={cn("relative w-full mb-8 last:mb-0", className)}
        {...(status === "in-progress" ? { "aria-current": "step" } : {})}
        {...props}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <div className="flex flex-col justify-start pt-1">
            <time
              dateTime={date ? new Date(date).toISOString() : undefined}
              className="text-sm font-medium tracking-tight text-muted-foreground text-right pr-4"
            >
              {formatTimelineDate(date)}
            </time>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "relative z-10 flex items-center justify-center rounded-full ring-8 ring-background shadow-sm",
                sizeClasses[iconsize],
                colorClasses[iconColor]
              )}
            >
              {icon ? (
                <div
                  className={cn(
                    "flex items-center justify-center",
                    iconSizeClasses[iconsize]
                  )}
                >
                  {icon}
                </div>
              ) : (
                <div
                  className={cn("rounded-full bg-current opacity-50", iconSizeClasses[iconsize])}
                />
              )}
            </div>
            {showConnector && (
              <div
                className={cn(
                  "h-16 w-0.5 mt-2",
                  status === "completed"
                    ? "bg-primary"
                    : status === "in-progress"
                      ? "bg-gradient-to-b from-primary to-muted"
                      : "bg-muted"
                )}
              />
            )}
          </div>
          <div className="flex flex-col gap-2 pl-2">
            {title && (
              <h3 className="font-semibold leading-none tracking-tight text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="max-w-sm text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </li>
    )
  }
)
TimelineItem.displayName = "TimelineItem"

export { Timeline, TimelineItem }
