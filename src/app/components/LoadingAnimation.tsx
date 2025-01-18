import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoadingAnimation() {
  return (
    <div className="flex justify-center mt-4">
      <div className="w-24 h-24">
        <DotLottieReact
          src="https://lottie.host/d6a8afbb-b7c1-4593-9b37-b50655f65790/eNKRMGiuLw.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
} 