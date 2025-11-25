import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, Cell, CellType, Period, Rule, Student, RuleType } from './types';
import { toast } from 'sonner';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const GRID_ROWS = 12;
const GRID_COLS = 16;

const createEmptyGrid = (): Cell[][] => {
  const grid: Cell[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push({
        id: `cell-${r}-${c}`,
        row: r,
        col: c,
        type: 'empty',
        studentId: null,
      });
    }
    grid.push(row);
  }
  return grid;
};

// Mock Students
const MOCK_STUDENTS: Student[] = Array.from({ length: 25 }, (_, i) => ({
  id: `student-${i}`,
  name: `Student ${i + 1}`,
  initials: `S${i + 1}`,
  color: `hsl(${Math.random() * 360}, 70%, 80%)`,
}));

const DEFAULT_STATE: AppState = {
  periods: Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Period ${i + 1}`,
    grid: createEmptyGrid(),
    students: [...MOCK_STUDENTS],
    rules: [],
  })),
  activePeriodId: 1,
  selectedTool: 'desk',
  isGenerating: false,
};

// Load initial state from localStorage if available
const loadState = (): AppState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('classroom-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }
  return DEFAULT_STATE;
};

interface ClassroomContextType extends AppState {
  setPeriod: (id: number) => void;
  setTool: (tool: CellType | 'select') => void;
  updateCell: (row: number, col: number) => void;
  addRule: (type: RuleType, studentIds: string[], radius?: number) => void;
  removeRule: (ruleId: string) => void;
  generateSeatingChart: () => void;
  clearGrid: () => void;
  hoveredRuleId: string | null;
  setHoveredRuleId: (id: string | null) => void;
  importStudents: (names: string) => void;
}

const ClassroomContext = createContext<ClassroomContextType | null>(null);

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadState);
  const [hoveredRuleId, setHoveredRuleId] = useState<string | null>(null);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('classroom-state', JSON.stringify(state));
  }, [state]);

  const activePeriodIndex = state.periods.findIndex(p => p.id === state.activePeriodId);
  const activePeriod = state.periods[activePeriodIndex];

  const setPeriod = (id: number) => setState(prev => ({ ...prev, activePeriodId: id }));
  const setTool = (tool: CellType | 'select') => setState(prev => ({ ...prev, selectedTool: tool }));

  const updateCell = (row: number, col: number) => {
    if (state.selectedTool === 'select') return;

    const newGrid = [...activePeriod.grid.map(row => [...row])];
    const cell = newGrid[row][col];
    
    if (cell.type === state.selectedTool) {
      cell.type = 'empty';
    } else {
      cell.type = state.selectedTool;
    }

    if (cell.type !== 'desk' && cell.type !== 'chair') {
      cell.studentId = null;
    }

    const newPeriods = [...state.periods];
    newPeriods[activePeriodIndex] = { ...activePeriod, grid: newGrid };
    setState(prev => ({ ...prev, periods: newPeriods }));
  };

  const addRule = (type: RuleType, studentIds: string[], radius: number = 1.5) => {
    const newRule: Rule = {
      id: generateId(),
      type,
      studentIds,
      radius,
      label: type === 'separate' ? 'Keep Separate' : type === 'front' ? 'Sit in Front' : 'Pair Together',
    };
    
    const newPeriods = [...state.periods];
    newPeriods[activePeriodIndex] = { 
      ...activePeriod, 
      rules: [...activePeriod.rules, newRule] 
    };
    setState(prev => ({ ...prev, periods: newPeriods }));
    toast.success("Rule added successfully");
  };

  const removeRule = (ruleId: string) => {
    const newPeriods = [...state.periods];
    newPeriods[activePeriodIndex] = { 
      ...activePeriod, 
      rules: activePeriod.rules.filter(r => r.id !== ruleId) 
    };
    setState(prev => ({ ...prev, periods: newPeriods }));
    toast.info("Rule removed");
  };

  const clearGrid = () => {
    const newGrid = createEmptyGrid();
    const newPeriods = [...state.periods];
    newPeriods[activePeriodIndex] = { ...activePeriod, grid: newGrid, rules: [] };
    setState(prev => ({ ...prev, periods: newPeriods }));
    toast.success("Classroom cleared");
  };

  const importStudents = (namesString: string) => {
    // Split by semicolon, filter empty
    const names = namesString
      .split(';')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (names.length === 0) {
      toast.error("No valid names found");
      return;
    }

    const newStudents: Student[] = names.map((name, i) => ({
      id: generateId(),
      name: name,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: `hsl(${Math.random() * 360}, 70%, 80%)`,
    }));

    const newPeriods = [...state.periods];
    // Replace students in active period. Keep grid, but clear student assignments on grid that refer to old students
    // Actually, we should probably clear the seating assignments if roster changes drastically
    
    // Clean grid of old student IDs
    const newGrid = activePeriod.grid.map(row => row.map(cell => ({
      ...cell,
      studentId: null // Reset seating when roster changes
    })));

    newPeriods[activePeriodIndex] = { 
      ...activePeriod, 
      students: newStudents,
      grid: newGrid,
      rules: [] // Clear rules as they reference old student IDs
    };
    
    setState(prev => ({ ...prev, periods: newPeriods }));
    toast.success(`Imported ${newStudents.length} students`);
  };

  const generateSeatingChart = () => {
    setState(prev => ({ ...prev, isGenerating: true }));

    setTimeout(() => {
      const newGrid = [...activePeriod.grid.map(row => [...row.map(c => ({...c, studentId: null as string | null}))])];
      const studentsToSeat = [...activePeriod.students].sort(() => Math.random() - 0.5);
      
      const seats: {r: number, c: number}[] = [];
      newGrid.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell.type === 'desk' || cell.type === 'chair') {
            seats.push({r, c});
          }
        });
      });

      const frontRuleStudents = new Set(
        activePeriod.rules
        .filter(r => r.type === 'front')
        .flatMap(r => r.studentIds)
      );

      const allSeatsSorted = seats.sort((a, b) => a.r - b.r);

      const isSafe = (r: number, c: number, studentId: string): boolean => {
        const conflictRules = activePeriod.rules.filter(rule => 
          rule.type === 'separate' && rule.studentIds.includes(studentId)
        );

        for (const rule of conflictRules) {
          const enemyId = rule.studentIds.find(id => id !== studentId);
          if (!enemyId) continue;

          for (let i = 0; i < GRID_ROWS; i++) {
            for (let j = 0; j < GRID_COLS; j++) {
              if (newGrid[i][j].studentId === enemyId) {
                const dist = Math.sqrt(Math.pow(r - i, 2) + Math.pow(c - j, 2));
                if (dist < (rule.radius || 1.5)) return false;
              }
            }
          }
        }
        return true;
      };

      const unseatedStudents: Student[] = [];

      studentsToSeat.forEach(student => {
        if (frontRuleStudents.has(student.id)) {
          const seatIndex = allSeatsSorted.findIndex(s => !newGrid[s.r][s.c].studentId && isSafe(s.r, s.c, student.id));
          if (seatIndex !== -1) {
             const seat = allSeatsSorted[seatIndex];
             newGrid[seat.r][seat.c].studentId = student.id;
          } else {
            unseatedStudents.push(student);
          }
        }
      });

      studentsToSeat.forEach(student => {
        if (frontRuleStudents.has(student.id) && !unseatedStudents.includes(student)) return;

        const availableSeats = allSeatsSorted.filter(s => !newGrid[s.r][s.c].studentId);
        
        let seated = false;
        for (let i=0; i<10; i++) {
            if (availableSeats.length === 0) break;
            const randIdx = Math.floor(Math.random() * availableSeats.length);
            const s = availableSeats[randIdx];
            
            if (isSafe(s.r, s.c, student.id)) {
                newGrid[s.r][s.c].studentId = student.id;
                seated = true;
                break;
            }
        }
        
        if (!seated && availableSeats.length > 0) {
             const s = availableSeats[0];
             newGrid[s.r][s.c].studentId = student.id;
        }
      });

      const newPeriods = [...state.periods];
      newPeriods[activePeriodIndex] = { ...activePeriod, grid: newGrid };
      setState(prev => ({ ...prev, periods: newPeriods, isGenerating: false }));
      toast.success("Seating chart generated!");
    }, 800);
  };

  return (
    <ClassroomContext.Provider value={{ ...state, setPeriod, setTool, updateCell, addRule, removeRule, generateSeatingChart, clearGrid, hoveredRuleId, setHoveredRuleId, importStudents }}>
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (!context) throw new Error('useClassroom must be used within a ClassroomProvider');
  return context;
};
