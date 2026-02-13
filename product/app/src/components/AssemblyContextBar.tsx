interface AssemblyContextBarProps {
  selectedAssembly: unknown;
  onSelectAssembly: (assembly: unknown) => void;
}

export function AssemblyContextBar(_props: AssemblyContextBarProps) {
  return (
    <div className="bg-green-500 text-white p-4 text-center font-bold">
      ✅ ASSEMBLY CONTEXT BAR IS RENDERING - Build successful!
    </div>
  );
}

export default AssemblyContextBar;
