interface DebugBannerProps {
  debugMode: boolean;
}

export default function DebugBanner({ debugMode }: DebugBannerProps) {
  if (!debugMode) return null;
  
  return (
    <div className="bg-yellow-100 px-4 py-2 text-sm text-yellow-800">
      Debug Mode Active (Ctrl/Cmd + D to toggle)
    </div>
  );
} 