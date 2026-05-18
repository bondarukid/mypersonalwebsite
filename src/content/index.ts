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

export { CONTENT_TS } from "@/content/constants"
export type * from "@/content/types"
export { getLandingCompany } from "@/content/site"
export { getSocialLinks } from "@/content/social"
export { getProjects, getProjectBySlug } from "@/content/projects"
export {
  getLandingFaqSet,
  getFaqSetById,
  getFaqItems,
  getFaqSetByProjectId,
} from "@/content/faq"
export {
  getLandingFeatureSection,
  getLandingFeatureCards,
  getLandingTechStackSection,
  getLandingTechStackCategories,
  getLandingTechStackItems,
} from "@/content/landing"
export { getLandingStatsContent } from "@/content/stats"
export { getTestimonial } from "@/content/testimonials"
export { getCertificatesForLocale } from "@/content/certificates"
export { getTimelineMilestonesWithDepth } from "@/content/about-timeline"
