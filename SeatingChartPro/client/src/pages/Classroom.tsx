import React from 'react';
import { ClassroomProvider } from '@/lib/store';
import { Toolbar } from '@/components/classroom/Toolbar';
import { Grid } from '@/components/classroom/Grid';
import { Sidebar } from '@/components/layout/Sidebar';

const Classroom = () => {
  return (
    <ClassroomProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <div className="flex flex-col flex-1 relative min-w-0">
            <Toolbar />
            <Grid />
        </div>
        <Sidebar />
      </div>
    </ClassroomProvider>
  );
};

export default Classroom;
