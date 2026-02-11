import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { PeoplePage } from './pages/PeoplePage'
import { ImportPage } from './pages/ImportPage'

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">Starwars</div>
        <nav className="app__nav">
          <Link to="/people">People</Link>
          <Link to="/imports">Import CSV</Link>
        </nav>
      </header>

      <main className="app__main">
        <Routes>
          <Route path="/" element={<Navigate to="/people" replace />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/imports" element={<ImportPage />} />
          <Route path="*" element={<Navigate to="/people" replace />} />
        </Routes>
      </main>
    </div>
  )
}

