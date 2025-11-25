import React from 'react';
import { useClassroom } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Grid = () => {
  const { periods, activePeriodId, updateCell, selectedTool, hoveredRuleId } = useClassroom();
  const activePeriod = periods.find(p => p.id === activePeriodId);

  if (!activePeriod) return null;

  // Rule Visualization Logic
  const hoveredRule = activePeriod.rules.find(r => r.id === hoveredRuleId);
  const highlightedStudentIds = hoveredRule?.studentIds || [];

  return (
    <div className="flex-1 bg-secondary/30 p-8 overflow-auto flex items-center justify-center bg-grid-pattern relative">
      <div 
        className="grid gap-2 p-8 bg-white rounded-xl shadow-sm border border-border/50 relative"
        style={{
          gridTemplateColumns: `repeat(${activePeriod.grid[0].length}, minmax(3rem, 1fr))`,
        }}
      >
        {/* Front Indicator */}
        <div className={cn(
            "absolute -top-8 left-0 right-0 flex justify-center transition-all duration-300",
            hoveredRule?.type === 'front' ? "scale-110" : ""
        )}>
            <div className={cn(
                "text-xs font-semibold uppercase tracking-widest px-4 py-1 rounded-full transition-colors",
                hoveredRule?.type === 'front' 
                    ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400/30" 
                    : "bg-muted/50 text-muted-foreground"
            )}>
                Front of Class
            </div>
        </div>

        {activePeriod.grid.map((row, r) => (
          <React.Fragment key={r}>
            {row.map((cell, c) => (
              <CellComponent 
                key={cell.id} 
                cell={cell} 
                onClick={() => updateCell(r, c)}
                isInteractive={selectedTool !== 'select'}
                isHighlighted={cell.studentId ? highlightedStudentIds.includes(cell.studentId) : false}
                highlightColor={hoveredRule?.type === 'separate' ? 'destructive' : 'primary'}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Connection Lines for Separate Rule */}
        {hoveredRule?.type === 'separate' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                {/* Logic to draw line between students if seated */}
                {(() => {
                    const s1Id = hoveredRule.studentIds[0];
                    const s2Id = hoveredRule.studentIds[1];
                    let p1, p2;
                    
                    // Find positions (rough estimation based on cell index)
                    // We need the DOM elements really, but we can estimate with percentages since it's a grid
                    // Actually, SVG overlay is tricky without exact coords.
                    // Let's stick to Cell highlighting for MVP, simpler and robust.
                    return null;
                })()}
            </svg>
        )}
      </div>
    </div>
  );
};

const CellComponent = ({ 
    cell, 
    onClick, 
    isInteractive, 
    isHighlighted,
    highlightColor 
}: { 
    cell: any, 
    onClick: () => void, 
    isInteractive: boolean,
    isHighlighted: boolean,
    highlightColor: 'primary' | 'destructive'
}) => {
  const { periods, activePeriodId } = useClassroom();
  const activePeriod = periods.find(p => p.id === activePeriodId);
  const student = cell.studentId ? activePeriod?.students.find(s => s.id === cell.studentId) : null;

  const getCellStyles = () => {
    switch (cell.type) {
      case 'desk':
        return "bg-white border-2 border-slate-200 hover:border-primary/50";
      case 'chair':
        return "bg-slate-100 rounded-full scale-75 border border-slate-200";
      case 'teacher':
        return "bg-indigo-50 border-2 border-indigo-200 col-span-2 w-full aspect-[2/1]";
      case 'door':
        return "bg-amber-100 border-l-4 border-amber-400";
      default:
        return "border border-dashed border-slate-200 hover:bg-slate-50";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-14 h-14 rounded-lg transition-all duration-200 flex items-center justify-center relative cursor-pointer group",
        getCellStyles(),
        cell.type === 'empty' && !isInteractive && "opacity-50",
        isInteractive && cell.type === 'empty' && "hover:scale-95",
        isHighlighted && highlightColor === 'destructive' && "ring-2 ring-destructive ring-offset-2 bg-destructive/5",
        isHighlighted && highlightColor === 'primary' && "ring-2 ring-blue-400 ring-offset-2 bg-blue-50",
      )}
    >
      {/* Placement Preview (Ghost) */}
      {isInteractive && cell.type === 'empty' && (
        <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {student && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm z-10 relative",
            )}
            style={{ backgroundColor: student.color || 'var(--primary)' }}
            layoutId={student.id}
          >
            {student.initials}
            {isHighlighted && (
                <motion.div 
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={cn(
                        "absolute inset-0 rounded-full border-2",
                        highlightColor === 'destructive' ? "border-destructive" : "border-blue-400"
                    )} 
                />
            )}
          </motion.div>
        )}
        {!student && cell.type === 'desk' && (
             <div className="w-full h-1 bg-slate-100 absolute top-2 rounded-full" />
        )}
        {!student && cell.type === 'teacher' && (
             <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Desk</span>
        )}
      </AnimatePresence>
    </div>
  );
};
