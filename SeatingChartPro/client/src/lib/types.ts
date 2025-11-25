export type CellType = 'empty' | 'desk' | 'chair' | 'teacher' | 'door';

export interface Cell {
  id: string;
  row: number;
  col: number;
  type: CellType;
  studentId?: string | null;
}

export interface Student {
  id: string;
  name: string;
  initials: string;
  color?: string;
}

export type RuleType = 'separate' | 'front' | 'pair';

export interface Rule {
  id: string;
  type: RuleType;
  studentIds: string[];
  radius?: number; // For separate/pair, in grid units
  label?: string;
}

export interface Period {
  id: number;
  name: string;
  grid: Cell[][];
  students: Student[];
  rules: Rule[];
}

export interface AppState {
  periods: Period[];
  activePeriodId: number;
  selectedTool: CellType | 'select';
  isGenerating: boolean;
}
