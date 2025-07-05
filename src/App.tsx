import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CityProvider } from './contexts/CityContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Items from './pages/Items'
import Prices from './pages/Prices'
import Recommendations from './pages/Recommendations'

function App() {
  return (
    <CityProvider>
      <Router>
        <div className="min-h-screen bg-bitcraft-dark">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/items" element={<Items />} />
              <Route path="/prices" element={<Prices />} />
              <Route path="/recommendations" element={<Recommendations />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CityProvider>
  )
}

export default App