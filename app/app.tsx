import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '.'
import ManageKeywords from './manageKeywords'

function App() {
  return (
    <Router>
      <Routes>
        {/* file name is the path (index -> /)*/}
        <Route element={<Home />} />
        <Route element={<ManageKeywords />} />
      </Routes>
    </Router>
  )
}

export default App
