import { useState } from 'react'
import { Link } from 'react-router-dom'
import { uploadCsv } from '../api'
import type { ImportResponse } from '../api'

function formatError(e: unknown) {
  return e instanceof Error ? e.message : String(e)
}

export function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResponse | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!file) {
      setError('Please choose a CSV file.')
      return
    }

    setLoading(true)
    try {
      const res = await uploadCsv(file)
      setResult(res)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  const skippedCount = result?.skipped?.length ?? 0
  const errorCount = result?.errors?.length ?? 0

  return (
    <section className="card">
      <header className="card__header">
        <div>
          <h1 className="card__title">Import characters</h1>
          <p className="card__subtitle">
            Upload a CSV. Then <Link to="/people">view imported characters</Link>.
          </p>
        </div>
      </header>

      <form className="form" onSubmit={onSubmit}>
        <label className="label">
          CSV file
          <input
            className="input"
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? 'Importing…' : 'Import'}
        </button>
      </form>

      {error ? <div className="alert alert--error">{error}</div> : null}

      {result ? (
        <div className="alert alert--success">
          Imported: <strong>{result.imported}</strong>. Skipped: <strong>{skippedCount}</strong>. Errors:{' '}
          <strong>{errorCount}</strong>.
        </div>
      ) : null}

      {result?.skipped?.length ? (
        <div className="card card--nested">
          <h2 className="h2">Skipped rows</h2>
          <ul className="list">
            {result.skipped.map((s) => (
              <li key={`${s.line}-${s.reason}`}>
                Line {s.line}: {s.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result?.errors?.length ? (
        <div className="card card--nested">
          <h2 className="h2">Errors</h2>
          <ul className="list">
            {result.errors.map((e, idx) => (
              <li key={idx}>
                {typeof e === 'string' ? e : `Line ${e.line}: ${e.message}`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="hint">
        CSV must have headers: Name, Location, Species, Gender, Affiliations. Weapon and Vehicle optional. Rows with
        empty Affiliations or missing required fields are skipped.
      </p>
    </section>
  )
}

