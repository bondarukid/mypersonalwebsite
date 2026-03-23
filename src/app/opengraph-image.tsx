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

import { ImageResponse } from "next/og"

export const alt = "Ivan Bondaruk — Full-Stack Developer & Web Engineer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Ivan Bondaruk
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginBottom: 32,
          }}
        >
          Full-Stack Developer & Web Engineer
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#64748b",
          }}
        >
          React • Next.js • TypeScript
        </div>
      </div>
    ),
    { ...size }
  )
}
