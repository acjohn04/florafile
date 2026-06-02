import { render, screen } from '@testing-library/react'
import { PlantCard } from './PlantCard'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  })
}));

describe('PlantCard', () => {
  it('renders plant information correctly', () => {
    const plant = {
      id: '1',
      nickname: 'Bob',
      commonName: 'Ficus',
      scientificName: 'Ficus lyrata',
      room: 'Living Room',
      status: 'healthy',
      imageUrl: null
    }

    render(<PlantCard plant={plant} />)
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Ficus(Ficus lyrata)')).toBeInTheDocument()
    expect(screen.getByText('Living Room')).toBeInTheDocument()
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })
})
