import React, { useState } from 'react';
import { useClassroom } from '@/lib/store';
import { cn } from '@/lib/utils';
import { User, Ban, ArrowUp, Trash2, Info, Upload, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Sidebar = () => {
  const { periods, activePeriodId, setPeriod, removeRule, setHoveredRuleId } = useClassroom();
  const activePeriod = periods.find(p => p.id === activePeriodId);

  if (!activePeriod) return null;

  return (
    <div className="w-80 border-l bg-card flex flex-col h-full shadow-xl shadow-black/5 z-20">
      {/* Period Selector */}
      <div className="p-4 border-b bg-secondary/20">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Class Period</h2>
        <div className="grid grid-cols-3 gap-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setPeriod(period.id)}
              className={cn(
                "h-9 text-sm font-medium rounded-md border transition-all",
                activePeriodId === period.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              {period.id}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Section */}
      <div className="p-4 border-b flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Seating Rules</h2>
          <AddRuleDialog />
        </div>

        <div className="space-y-3">
          {activePeriod.rules.length === 0 && (
            <div className="text-center py-8 px-4 bg-secondary/30 rounded-lg border border-dashed">
              <Info className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No rules set yet. Add constraints to guide the seating chart.</p>
            </div>
          )}
          {activePeriod.rules.map((rule) => (
            <div 
                key={rule.id} 
                className="bg-white p-3 rounded-lg border shadow-sm group relative hover:border-primary/30 transition-colors cursor-default"
                onMouseEnter={() => setHoveredRuleId(rule.id)}
                onMouseLeave={() => setHoveredRuleId(null)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {rule.type === 'separate' && <Ban className="w-4 h-4 text-destructive" />}
                  {rule.type === 'front' && <ArrowUp className="w-4 h-4 text-blue-500" />}
                  <span className="text-sm font-medium text-foreground">
                    {rule.label}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      removeRule(rule.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {rule.type === 'separate' && (
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-mono bg-secondary px-1 rounded text-[10px]">Radius: {rule.radius}</span>
                  </div>
                )}
                {rule.type === 'front' && (
                   <span className="mb-1 block">Priority: High</span>
                )}
                
                <div className="flex flex-wrap gap-1">
                    {rule.studentIds.map(sid => {
                        const s = activePeriod.students.find(st => st.id === sid);
                        return (
                            <span key={sid} className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-medium border flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{background: s?.color}} />
                                {s?.name}
                            </span>
                        )
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student List Snippet */}
      <div className="p-4 bg-secondary/10 border-t">
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roster ({activePeriod.students.length})</h2>
            <ImportStudentsDialog />
        </div>
        
        <div className="flex -space-x-2 overflow-hidden py-1">
             {activePeriod.students.slice(0, 8).map(s => (
                 <div key={s.id} className="w-7 h-7 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[9px] text-white font-bold relative z-0 hover:z-10 transition-all hover:scale-110" style={{backgroundColor: s.color}}>
                     {s.initials}
                 </div>
             ))}
             {activePeriod.students.length > 8 && (
                 <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] text-muted-foreground font-bold z-0">
                     +{activePeriod.students.length - 8}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

const ImportStudentsDialog = () => {
    const { importStudents } = useClassroom();
    const [names, setNames] = useState('');
    const [open, setOpen] = useState(false);

    const handleImport = () => {
        if (names.trim()) {
            importStudents(names);
            setOpen(false);
            setNames('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white">
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Students</DialogTitle>
                    <DialogDescription>
                        Paste your student roster below. Existing students will be replaced.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-md flex gap-3 items-start">
                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">Format Tip</p>
                            <p className="text-blue-800/80 leading-relaxed">
                                Separate names with semicolons (;).
                                <br />
                                Example: <code className="bg-blue-100 px-1 rounded">Bob Jeff; Joe Sandy; Alice Smith;</code>
                            </p>
                            <p className="mt-2 text-xs opacity-80">
                                💡 Ask AI to "cleanup this list into semicolon separated format" before pasting.
                            </p>
                        </div>
                    </div>
                    <Textarea 
                        value={names}
                        onChange={(e) => setNames(e.target.value)}
                        placeholder="Paste names here..."
                        className="h-32 font-mono text-sm"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleImport} disabled={!names.trim()}>Import Roster</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AddRuleDialog = () => {
  const { periods, activePeriodId, addRule } = useClassroom();
  const activePeriod = periods.find(p => p.id === activePeriodId);
  
  const [type, setType] = useState<'separate' | 'front'>('separate');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [radius, setRadius] = useState([1.5]);
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (selectedStudents.length > 0) {
        addRule(type, selectedStudents, radius[0]);
        setOpen(false);
        setSelectedStudents([]);
        setRadius([1.5]);
    }
  };

  const toggleStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
        setSelectedStudents(selectedStudents.filter(s => s !== id));
    } else {
        if (type === 'separate' && selectedStudents.length >= 2) {
             setSelectedStudents([...selectedStudents, id]);
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
           <span>+</span> Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Seating Rule</DialogTitle>
          <DialogDescription>
            Define constraints for the seating algorithm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rule-type">Rule Type</Label>
            <Select value={type} onValueChange={(v: any) => { setType(v); setSelectedStudents([]); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="separate">Separate (Don't sit nearby)</SelectItem>
                <SelectItem value="front">Sit in Front</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'separate' && (
            <div className="grid gap-2 bg-secondary/30 p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                  <Label>Separation Radius</Label>
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border">{radius[0]} units</span>
              </div>
              <Slider 
                value={radius} 
                onValueChange={setRadius} 
                max={4} 
                min={1} 
                step={0.5} 
                className="my-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Adjacent</span>
                  <span>1 Seat Gap</span>
                  <span>Far Away</span>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Select Students {selectedStudents.length > 0 && <span className="text-primary">({selectedStudents.length})</span>}</Label>
            <div className="h-[200px] overflow-y-auto border rounded-md p-1 space-y-1 bg-slate-50">
                {activePeriod?.students.map(student => (
                    <div 
                        key={student.id}
                        onClick={() => toggleStudent(student.id)}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-all border border-transparent",
                            selectedStudents.includes(student.id)
                                ? "bg-white border-primary/30 shadow-sm text-primary font-medium ring-1 ring-primary/10"
                                : "hover:bg-white hover:shadow-sm"
                        )}
                    >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] text-white font-bold" style={{background: student.color}}>
                            {student.initials}
                        </div>
                        {student.name}
                        {selectedStudents.includes(student.id) && (
                            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
                {type === 'separate' ? 'Select 2 or more students to keep them apart.' : 'Select students who need to sit in the front rows.'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={selectedStudents.length === 0}>Save Rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
