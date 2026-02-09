import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ChapterPage from './pages/ChapterPage'
import SummaryHomePage from './pages/SummaryHomePage'
import SummaryPage from './pages/SummaryPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="chapter/:chapterSlug" element={<ChapterPage />} />
        <Route path="summary" element={<SummaryHomePage />} />
        <Route path="summary/:chapterSlug" element={<SummaryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
