/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
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

/**
 * Visual Studio Code mark (plain). Path from Devicon (MIT), adapted for
 * react-simple-icons-style props (title, color, size).
 * @see https://github.com/devicons/devicon
 */

import * as React from "react"

const defaultColor = "#007ACC"

const SiVisualStudioCode = React.forwardRef(function SiVisualStudioCodeInner(
  {
    title = "Visual Studio Code",
    color = "currentColor",
    size = 24,
    ...others
  }: {
    title?: string
    color?: string
    size?: string | number
  } & React.SVGProps<SVGSVGElement>,
  ref: React.ForwardedRef<SVGSVGElement>
) {
  let fill = color
  if (fill === "default") {
    fill = defaultColor
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 128 128"
      ref={ref}
      {...others}
    >
      <title>{title}</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M90.767 127.126a7.968 7.968 0 0 0 6.35-.244l26.353-12.681a8 8 0 0 0 4.53-7.209V21.009a8 8 0 0 0-4.53-7.21L97.117 1.12a7.97 7.97 0 0 0-9.093 1.548l-50.45 46.026L15.6 32.013a5.328 5.328 0 0 0-6.807.302l-7.048 6.411a5.335 5.335 0 0 0-.006 7.888L20.796 64 1.74 81.387a5.336 5.336 0 0 0 .006 7.887l7.048 6.411a5.327 5.327 0 0 0 6.807.303l21.974-16.68 50.45 46.025a7.96 7.96 0 0 0 2.743 1.793Zm5.252-92.183L57.74 64l38.28 29.058V34.943Z"
      />
    </svg>
  )
})

SiVisualStudioCode.displayName = "SiVisualStudioCode"

export { SiVisualStudioCode, defaultColor }
