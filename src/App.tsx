import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Archive from '@/pages/Archive'
import Themes from '@/pages/Themes'
import Stories from '@/pages/Stories'
import Circulation from '@/pages/Circulation'
import Exhibitions from '@/pages/Exhibitions'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/archive" replace />} />
        <Route element={<Layout />}>
          <Route path="/archive" element={<Archive />} />
          <Route path="/themes" element={<Themes />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/circulation" element={<Circulation />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
