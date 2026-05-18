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

import type { Company } from "@/content/types"
import { CONTENT_TS } from "@/content/constants"

const landingCompany: Company = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Ivan Bondaruk",
  slug: "landing",
  logo_url: null,
  created_at: CONTENT_TS,
  created_by: null,
}

export function getLandingCompany(): Company {
  return landingCompany
}
