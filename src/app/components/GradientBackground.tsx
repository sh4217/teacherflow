export default function GradientBackground() {
  return (
    <>
      {/* Main gradient background */}
      <div 
        className="fixed inset-0 -z-20 animate-[gradient_20s_ease_infinite]"
        style={{
          background: `
            linear-gradient(
              -45deg,
              #ffffff,
              #f8f9ff,
              #ffffff,
              #f9fffd,
              #ffffff,
              #fff9f8
            )
          `,
          backgroundSize: '400% 400%',
          animation: 'gradient 20s ease infinite'
        }}
      >
        <style>{`
          @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}</style>
      </div>
      
      {/* Subtle overlay for depth */}
      <div 
        className="fixed inset-0 -z-10 opacity-20"
        style={{
          background: `
            radial-gradient(
              circle at 30% 20%,
              rgba(255, 255, 255, 0.4) 0%,
              transparent 60%
            )
          `
        }}
      />
    </>
  );
} 