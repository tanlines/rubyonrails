import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid'
import { getPeople } from '../api'
import type { PeopleResponse } from '../api'

type SortKey = 'first_name' | 'last_name' | 'species' | 'gender' | 'weapon' | 'vehicle'

function clampInt(value: string | null, def: number, min: number, max: number) {
  const n = parseInt(value ?? '', 10)
  if (!Number.isFinite(n)) return def
  return Math.min(Math.max(n, min), max)
}

export function PeoplePage() {
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') ?? ''
  const sort = sp.get('sort')
  const direction = sp.get('direction')
  const page = clampInt(sp.get('page'), 1, 1, 1_000_000)
  const perPage = clampInt(sp.get('per_page'), 10, 1, 100)

  const [data, setData] = useState<PeopleResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      q: q.trim() || undefined,
      sort: sort || undefined,
      direction: direction || undefined,
      page,
      per_page: perPage,
    }),
    [q, sort, direction, page, perPage],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getPeople(query)
      .then((res) => {
        if (cancelled) return
        setData(res)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setData(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query])

  function setParam(name: string, value: string | null) {
    const next = new URLSearchParams(sp)
    if (!value) next.delete(name)
    else next.set(name, value)
    if (name !== 'page') next.delete('page')
    setSp(next, { replace: false })
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(sp)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSp(next, { replace: false })
  }

  const totalCount = data?.total_count ?? 0
  const rows = data?.people ?? []
  const sortDir = (direction ?? 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'
  const sortKey = (sort as SortKey | null) ?? null

  const columns = useMemo<Array<GridColDef>>(
    () => [
      { field: 'first_name', headerName: 'First name', flex: 1, minWidth: 140, sortable: true },
      { field: 'last_name', headerName: 'Last name', flex: 1, minWidth: 140, sortable: true },
      { field: 'species', headerName: 'Species', flex: 1, minWidth: 160, sortable: true },
      { field: 'gender', headerName: 'Gender', flex: 1, minWidth: 120, sortable: true },
      { field: 'weapon', headerName: 'Weapon', flex: 1, minWidth: 160, sortable: true },
      { field: 'vehicle', headerName: 'Vehicle', flex: 1, minWidth: 160, sortable: true },
      {
        field: 'locations',
        headerName: 'Locations',
        flex: 1,
        minWidth: 220,
        sortable: false,
        valueGetter: (_value, row: any) => (row.locations ? row.locations.map((l: any) => l.name).join(', ') : ''),
      },
      {
        field: 'affiliations',
        headerName: 'Affiliations',
        flex: 1,
        minWidth: 240,
        sortable: false,
        valueGetter: (_value, row: any) =>
          row.affiliations ? row.affiliations.map((a: any) => a.name).join(', ') : '',
      },
    ],
    [],
  )

  const paginationModel = useMemo<GridPaginationModel>(
    () => ({
      page: Math.max(page - 1, 0),
      pageSize: perPage,
    }),
    [page, perPage],
  )

  const sortingModel = useMemo<GridSortModel>(
    () => (sortKey ? [{ field: sortKey, sort: sortDir }] : []),
    [sortKey, sortDir],
  )

  return (
    <Paper sx={{ p: 2, backgroundImage: 'none' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Imported characters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading…' : `${totalCount} ${totalCount === 1 ? 'result' : 'results'}`}
            {q.trim() ? ` for “${q.trim()}”` : null}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ minWidth: { sm: 520 } }}>
          <TextField
            size="small"
            fullWidth
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Search by name, species, gender, weapon, vehicle, location, affiliation…"
          />
          <Button variant="contained" onClick={() => goToPage(1)} disabled={loading} sx={{ whiteSpace: 'nowrap' }}>
            Search
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Box sx={{ mt: 2, color: 'error.main' }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      ) : null}

      <Box sx={{ mt: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={totalCount}
          loading={loading}
          disableRowSelectionOnClick
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => {
            const next = new URLSearchParams(sp)
            next.set('per_page', String(model.pageSize))
            if (model.page <= 0) next.delete('page')
            else next.set('page', String(model.page + 1))
            setSp(next, { replace: false })
          }}
          sortModel={sortingModel}
          onSortModelChange={(model: GridSortModel) => {
            const next = new URLSearchParams(sp)
            const item = model[0]
            if (!item?.field || !item.sort) {
              next.delete('sort')
              next.delete('direction')
              next.delete('page')
              setSp(next, { replace: false })
              return
            }

            // Only allow known sort keys to be sent to the backend.
            const allowed: SortKey[] = ['first_name', 'last_name', 'species', 'gender', 'weapon', 'vehicle']
            if (!allowed.includes(item.field as SortKey)) return

            next.set('sort', item.field)
            next.set('direction', item.sort)
            next.delete('page')
            setSp(next, { replace: false })
          }}
          pageSizeOptions={[10]}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(11, 18, 32, 0.85)',
            },
          }}
        />
      </Box>
    </Paper>
  )
}

