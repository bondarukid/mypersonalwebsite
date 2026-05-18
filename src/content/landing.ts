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

import type {
  LandingFeatureCardRow,
  LandingFeatureSectionRow,
  LandingTechStackCategoryRow,
  LandingTechStackItemRow,
  LandingTechStackSectionRow,
} from "@/lib/landing-home-i18n"
import { CONTENT_TS } from "@/content/constants"

const featureSection: LandingFeatureSectionRow = {
  heading_en: "Why work with me",
  heading_uk: "Чому варто працювати зі мною",
  heading_ja: "一緒に働く理由",
  intro_en:
    "I focus on clear communication, maintainable code, and shipping products that users actually enjoy.",
  intro_uk:
    "Роблю наголос на зрозумілій комунікації, підтримуваному коді та продуктах, якими люди користуються з задоволенням.",
  intro_ja:
    "わかりやすいコミュニケーション、保守しやすいコード、ユーザーが使いたくなるプロダクトづくりを心がけています。",
  created_at: CONTENT_TS,
  updated_at: CONTENT_TS,
}

const featureCards: LandingFeatureCardRow[] = [
  {
    id: "feat-1",
    sort_order: 0,
    lucide_icon: "zap",
    title_en: "Fast iteration",
    title_uk: "Швидкі ітерації",
    title_ja: "素早い改善サイクル",
    body_en: "Short feedback loops so you see progress quickly.",
    body_uk: "Короткі цикли зворотного зв’язку — ви бачите прогрес швидко.",
    body_ja: "フィードバックを早く回し、進捗をすぐ共有します。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "feat-2",
    sort_order: 1,
    lucide_icon: "cpu",
    title_en: "Solid engineering",
    title_uk: "Надійна інженерія",
    title_ja: "堅牢な実装",
    body_en: "Type-safe stacks, tests where they matter, and pragmatic architecture.",
    body_uk: "Типобезпека, тести там де потрібно, прагматична архітектура.",
    body_ja: "型安全なスタック、必要なところでのテスト、実践的な設計。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "feat-3",
    sort_order: 2,
    lucide_icon: "fingerprint",
    title_en: "Security-minded",
    title_uk: "З упором на безпеку",
    title_ja: "セキュリティを意識",
    body_en: "Least privilege, careful handling of secrets, and sensible defaults.",
    body_uk: "Мінімальні права, обережна робота з секретами, здорові дефолти.",
    body_ja: "最小権限、シークレットの扱い、安全なデフォルト設定。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
]

const techSection: LandingTechStackSectionRow = {
  heading_en: "Tech I reach for",
  heading_uk: "Технології, до яких звертаюсь",
  heading_ja: "よく使う技術",
  subcopy_en: "A few tools and frameworks I use to deliver production-quality work.",
  subcopy_uk: "Інструменти та фреймворки для продуктивної якості.",
  subcopy_ja: "本番品質の開発によく使うツールとフレームワークです。",
  learn_more_en: "See projects",
  learn_more_uk: "До проєктів",
  learn_more_ja: "プロジェクトを見る",
  created_at: CONTENT_TS,
  updated_at: CONTENT_TS,
}

const techCategories: LandingTechStackCategoryRow[] = [
  {
    id: "tech-cat-mobile",
    sort_order: 0,
    label_en: "Mobile",
    label_uk: "Мобільні",
    label_ja: "モバイル",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-cat-web",
    sort_order: 1,
    label_en: "Web",
    label_uk: "Веб",
    label_ja: "Web",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-cat-ide",
    sort_order: 2,
    label_en: "IDE",
    label_uk: "IDE",
    label_ja: "IDE",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
]

const techItems: LandingTechStackItemRow[] = [
  {
    id: "tech-i-1",
    category_id: "tech-cat-mobile",
    sort_order: 0,
    simple_icon_slug: "swift",
    title_en: "Swift & SwiftUI",
    title_uk: "Swift та SwiftUI",
    title_ja: "Swift / SwiftUI",
    desc_en: "Native iOS experiences when the platform matters.",
    desc_uk: "Нативний iOS, коли важлива платформа.",
    desc_ja: "プラットフォーム体験を重視する iOS ネイティブ。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-mobile-kotlin",
    category_id: "tech-cat-mobile",
    sort_order: 1,
    simple_icon_slug: "kotlin",
    title_en: "Kotlin",
    title_uk: "Kotlin",
    title_ja: "Kotlin",
    desc_en:
      "Native Android and shared Kotlin Multiplatform code where one codebase should ship on mobile.",
    desc_uk:
      "Нативний Android і спільний Kotlin Multiplatform, коли один код має працювати на мобільних.",
    desc_ja:
      "ネイティブ Android と、モバイル向けにコードを共有したいときの Kotlin Multiplatform。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-2",
    category_id: "tech-cat-web",
    sort_order: 0,
    simple_icon_slug: "nextdotjs",
    title_en: "Next.js",
    title_uk: "Next.js",
    title_ja: "Next.js",
    desc_en:
      "App Router, React Server Components, and static generation for fast marketing sites and apps.",
    desc_uk:
      "App Router, React Server Components і статична генерація для швидких сайтів і застосунків.",
    desc_ja:
      "App Router、React Server Components、高速なマーケサイトとアプリ向けの静的生成。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-3",
    category_id: "tech-cat-web",
    sort_order: 1,
    simple_icon_slug: "react",
    title_en: "React",
    title_uk: "React",
    title_ja: "React",
    desc_en: "Component models that scale across teams.",
    desc_uk: "Компонентна модель, яка масштабується.",
    desc_ja: "チームで育てやすいコンポーネント設計。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-web-tailwind",
    category_id: "tech-cat-web",
    sort_order: 2,
    simple_icon_slug: "tailwindcss",
    title_en: "Tailwind CSS",
    title_uk: "Tailwind CSS",
    title_ja: "Tailwind CSS",
    desc_en:
      "Utility-first styling, design tokens in the cascade, and fast iteration without leaving the markup.",
    desc_uk:
      "Utility-first стилі, токени в каскаді й швидкі ітерації без відриву від розмітки.",
    desc_ja:
      "ユーティリティファーストのスタイル、カスケードでのトークン、マークアップから離れずに速く試せること。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-web-shadcn",
    category_id: "tech-cat-web",
    sort_order: 3,
    simple_icon_slug: "shadcnui",
    title_en: "shadcn/ui",
    title_uk: "shadcn/ui",
    title_ja: "shadcn/ui",
    desc_en:
      "Copy-paste components built on Radix primitives and Tailwind — accessible, themeable, and fully owned in the repo.",
    desc_uk:
      "Компоненти на Radix і Tailwind, які копіюєш у проєкт — доступність, теми й повний контроль у репозиторії.",
    desc_ja:
      "Radix と Tailwind を土台にしたコピペコンポーネント。アクセシブルでテーマ対応、リポジトリ内で所有。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-ide-vs",
    category_id: "tech-cat-ide",
    sort_order: 0,
    simple_icon_slug: "visualstudio",
    title_en: "Visual Studio",
    title_uk: "Visual Studio",
    title_ja: "Visual Studio",
    desc_en:
      "Full IDE for .NET, C++, and native Windows tooling when the project calls for it.",
    desc_uk:
      "Повноцінне IDE для .NET, C++ і нативних Windows-інструментів, коли це потрібно проєкту.",
    desc_ja:
      ".NET や C++、Windows ネイティブ開発が主役のプロジェクト向けのフル IDE。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-ide-vscode",
    category_id: "tech-cat-ide",
    sort_order: 1,
    simple_icon_slug: "vscode",
    title_en: "VS Code",
    title_uk: "VS Code",
    title_ja: "VS Code",
    desc_en: "Extensions, remote development, and the editor I use daily for web and scripts.",
    desc_uk:
      "Розширення, remote development і редактор, який щодня використовую для вебу та скриптів.",
    desc_ja:
      "拡張機能と Remote Development、Web とスクリプトで毎日使うエディター。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-ide-webstorm",
    category_id: "tech-cat-ide",
    sort_order: 2,
    simple_icon_slug: "webstorm",
    title_en: "WebStorm",
    title_uk: "WebStorm",
    title_ja: "WebStorm",
    desc_en: "Deep refactoring and navigation for large TypeScript and React codebases.",
    desc_uk: "Глибокий рефакторинг і навігація у великих TypeScript/React кодових базах.",
    desc_ja: "大規模な TypeScript / React コードベースのリファクタリングと探索。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-ide-as",
    category_id: "tech-cat-ide",
    sort_order: 3,
    simple_icon_slug: "androidstudio",
    title_en: "Android Studio",
    title_uk: "Android Studio",
    title_ja: "Android Studio",
    desc_en: "Official Android IDE for Kotlin, Gradle, emulators, and Play Console workflows.",
    desc_uk:
      "Офіційне Android IDE для Kotlin, Gradle, емуляторів і робочих процесів Play Console.",
    desc_ja:
      "Kotlin、Gradle、エミュレーター、Play Console 連携向けの公式 Android IDE。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
  {
    id: "tech-i-ide-xcode",
    category_id: "tech-cat-ide",
    sort_order: 4,
    simple_icon_slug: "xcode",
    title_en: "Xcode",
    title_uk: "Xcode",
    title_ja: "Xcode",
    desc_en: "Apple’s IDE for Swift, SwiftUI, Simulator, and App Store signing.",
    desc_uk:
      "IDE від Apple для Swift, SwiftUI, Simulator і підписання для App Store.",
    desc_ja:
      "Swift / SwiftUI、シミュレーター、App Store 署名の公式 Apple IDE。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
]

export function getLandingFeatureSection(): LandingFeatureSectionRow | null {
  return featureSection
}

export function getLandingFeatureCards(): LandingFeatureCardRow[] {
  return featureCards
}

export function getLandingTechStackSection(): LandingTechStackSectionRow | null {
  return techSection
}

export function getLandingTechStackCategories(): LandingTechStackCategoryRow[] {
  return [...techCategories].sort((a, b) => a.sort_order - b.sort_order)
}

export function getLandingTechStackItems(): LandingTechStackItemRow[] {
  return techItems
}
