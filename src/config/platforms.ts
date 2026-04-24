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

export type PlatformGroup = {
  id: string
  label: string
  platforms: { id: string; label: string }[]
}

export const PLATFORM_GROUPS: PlatformGroup[] = [
  {
    id: "apple",
    label: "Apple",
    platforms: [
      { id: "ios", label: "iOS" },
      { id: "ipados", label: "iPadOS" },
      { id: "macos", label: "macOS" },
      { id: "tvos", label: "tvOS" },
      { id: "watchos", label: "watchOS" },
    ],
  },
  {
    id: "google",
    label: "Google",
    platforms: [
      { id: "android", label: "Android" },
      { id: "android_tv", label: "Android TV" },
    ],
  },
  {
    id: "steam",
    label: "Steam",
    platforms: [
      { id: "windows", label: "Windows" },
      { id: "macos", label: "macOS" },
      { id: "linux", label: "Linux" },
      { id: "steam_deck", label: "Steam Deck" },
    ],
  },
]

export const STORE_LINKS = [
  { id: "google_play", label: "Google Play", urlPlaceholder: "https://play.google.com/..." },
  { id: "app_store", label: "App Store", urlPlaceholder: "https://apps.apple.com/..." },
  { id: "steam", label: "Steam", urlPlaceholder: "https://store.steampowered.com/..." },
] as const
