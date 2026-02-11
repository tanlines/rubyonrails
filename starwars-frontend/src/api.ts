export type Person = {
  id: number
  first_name: string
  last_name: string | null
  species: string
  gender: string
  weapon: string | null
  vehicle: string | null
  locations: { name: string }[]
  affiliations: { name: string }[]
}

export type PeopleResponse = {
  people: Person[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
}

export type ImportSkipped = { line: number; reason: string }
export type ImportError = string | { line: number; message: string }
export type ImportResponse = {
  imported: number
  skipped: ImportSkipped[]
  errors: ImportError[]
  error?: string
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const contentType = res.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string'
        ? (data as any).error
        : `Request failed (${res.status})`) as string
    throw new Error(msg)
  }

  return data as T
}

export function getPeople(params: {
  q?: string
  sort?: string
  direction?: string
  page?: number
  per_page?: number
}): Promise<PeopleResponse> {
  const usp = new URLSearchParams()
  if (params.q) usp.set('q', params.q)
  if (params.sort) usp.set('sort', params.sort)
  if (params.direction) usp.set('direction', params.direction)
  if (params.page && params.page > 1) usp.set('page', String(params.page))
  if (params.per_page && params.per_page > 0) usp.set('per_page', String(params.per_page))

  const qs = usp.toString()
  const url = qs ? `/api/people?${qs}` : '/api/people'
  return requestJson<PeopleResponse>(url)
}

export async function uploadCsv(file: File): Promise<ImportResponse> {
  const form = new FormData()
  form.append('file', file)

  return requestJson<ImportResponse>('/api/imports', {
    method: 'POST',
    body: form,
  })
}

