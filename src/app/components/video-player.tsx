interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  // If videoUrl is just the filename, prepend the backend URL
  const fullVideoUrl = videoUrl.startsWith('http') 
    ? videoUrl 
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/${videoUrl}`;

  return (
    <video controls className="max-w-full rounded-xl">
      <source src={fullVideoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
