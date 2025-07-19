import { useState, useRef, useEffect } from 'react'
import { BitCraftItem } from '../types'

interface AutocompleteSelectProps {
  value: string
  onChange: (value: string) => void
  items: BitCraftItem[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function AutocompleteSelect({ 
  value, 
  onChange, 
  items, 
  placeholder = "Rechercher un objet...", 
  disabled = false,
  className = ""
}: AutocompleteSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedItem = items.find(item => item.id === value)
  
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10) // Limite à 10 résultats pour la performance

  useEffect(() => {
    if (selectedItem && !isOpen) {
      setSearchTerm(selectedItem.name)
    } else if (!selectedItem && !isOpen) {
      setSearchTerm('')
    }
  }, [selectedItem, isOpen])

  // Effet pour initialiser le searchTerm au montage du composant
  useEffect(() => {
    if (selectedItem && searchTerm === '') {
      setSearchTerm(selectedItem.name)
    }
  }, [selectedItem])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchTerm])

  const handleInputFocus = () => {
    setIsOpen(true)
    setSearchTerm('')
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false)
      if (selectedItem) {
        setSearchTerm(selectedItem.name)
      } else {
        setSearchTerm('')
      }
    }, 150)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)
    setIsOpen(true)
  }

  const handleItemSelect = (item: BitCraftItem) => {
    onChange(item.id)
    setIsOpen(false)
    setSearchTerm(item.name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        setSearchTerm('')
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        )
        e.preventDefault()
        break
      case 'ArrowUp':
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        e.preventDefault()
        break
      case 'Enter':
        if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
          handleItemSelect(filteredItems[highlightedIndex])
        }
        e.preventDefault()
        break
      case 'Escape':
        setIsOpen(false)
        if (selectedItem) {
          setSearchTerm(selectedItem.name)
        } else {
          setSearchTerm('')
        }
        e.preventDefault()
        break
    }
  }

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary bg-white"
      />
      
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <li
                key={item.id}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleItemSelect(item)
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  index === highlightedIndex ? 'bg-bitcraft-primary text-white' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-black">{item.name}</span>
                  <span className="text-sm text-gray-500">Tier {item.tier}</span>
                </div>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500 italic">
              Aucun objet trouvé
            </li>
          )}
        </ul>
      )}
    </div>
  )
}