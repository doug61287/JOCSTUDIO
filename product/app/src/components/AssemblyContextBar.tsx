import React from 'react';

interface AssemblyContextBarProps {
  selectedAssembly: any;
  onSelectAssembly: (assembly: any) => void;
}

export function AssemblyContextBar({ selectedAssembly, onSelectAssembly }: AssemblyContextBarProps) {
  return (
    <div className="bg-green-500 text-white p-4 text-center font-bold">
      ✅ ASSEMBLY CONTEXT BAR IS RENDERING - This proves the component works!
    </div>
  );
}

export default AssemblyContextBar;
