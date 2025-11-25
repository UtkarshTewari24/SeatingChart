import React from 'react';
import { useClassroom } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Monitor, Square, Armchair, Users, X, MousePointer2 } from 'lucide-react';

export const Toolbar = () => {
  const { selectedTool, setTool, clearGrid, generateSeatingChart, isGenerating } = useClassroom();

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'desk', icon: Square, label: 'Desk' },
    { id: 'chair', icon: Armchair, label: 'Chair' },
    { id: 'teacher', icon: Monitor, label: 'Teacher' },
    { id: 'empty', icon: X, label: 'Eraser' },
  ];

  return (
    <div className="h-16 border-b bg-card flex items-center justify-between px-6 shadow-sm z-10 relative">
      <div className="flex items-center gap-2">
        <div className="flex bg-secondary/50 p-1 rounded-lg gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id as any)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                selectedTool === tool.id
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <tool.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
            onClick={clearGrid}
            className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
            Clear Room
        </button>
        <div className="h-6 w-px bg-border" />
        <button
          onClick={generateSeatingChart}
          disabled={isGenerating}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm transition-all",
            isGenerating 
                ? "bg-primary/70 text-white cursor-wait"
                : "bg-primary text-white hover:bg-primary/90 hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          <Users className="w-4 h-4" />
          {isGenerating ? 'Solving...' : 'Generate Chart'}
        </button>
      </div>
    </div>
  );
};
