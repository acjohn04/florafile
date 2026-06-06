export interface PlantData {
  commonName: string;
  scientificName: string;
  description: string;
  light: string;
  water: string;
  toxicity: string;
  careLevel: string;
}

export interface Task {
  id: string;
  plantId: string;
  type: string;
  label: string;
  description: string | null;
  dayOfWeek: number;
  completed: boolean;
  plant?: {
    nickname: string;
    commonName: string;
  };
}
