import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoadingAnimation() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-32 h-32">
        <DotLottieReact
          src="https://lottie.host/d6a8afbb-b7c1-4593-9b37-b50655f65790/eNKRMGiuLw.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
} 