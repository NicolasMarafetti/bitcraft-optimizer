import { Link } from 'react-router-dom'
import CitySelector from './CitySelector'

export default function Navbar() {
  return (
    <nav className="bg-bitcraft-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-white text-xl font-bold">
            BitCraft Optimizer
          </Link>
          
          <div className="flex items-center space-x-6">
            <CitySelector className="text-white" />
            
            <div className="flex space-x-4">
              <Link
                to="/"
                className="text-white hover:text-bitcraft-accent px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/items"
                className="text-white hover:text-bitcraft-accent px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Objets
              </Link>
              <Link
                to="/prices"
                className="text-white hover:text-bitcraft-accent px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Prix
              </Link>
              <Link
                to="/recommendations"
                className="text-white hover:text-bitcraft-accent px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Recommandations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}