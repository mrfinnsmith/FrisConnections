import { Puzzle } from '@/types/game'

export const mockPuzzle: Puzzle = {
  id: 1,
  date: '2024-01-15',
  puzzle_number: 1,
  categories: [
    {
      id: 1,
      name: 'SF HILLS',
      difficulty: 1,
      items: ['Twin Peaks', 'Nob Hill', 'Russian Hill', 'Telegraph Hill'],
    },
    {
      id: 2,
      name: 'THINGS IN GOLDEN GATE PARK',
      difficulty: 2,
      items: ['Bison', 'Museum', 'Windmill', 'Gardens'],
    },
    {
      id: 3,
      name: 'FOOD INVENTED IN SF',
      difficulty: 3,
      items: ['Irish Coffee', 'Sourdough', 'Mission Burrito', 'Cioppino'],
    },
    {
      id: 4,
      name: 'TECH TERMS WITH SF MEANINGS',
      difficulty: 4,
      items: ['Oracle', 'Salesforce', 'Uber', 'Twitter'],
    },
  ],
}
