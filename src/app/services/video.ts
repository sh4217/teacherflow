export type ProgressCallback = (progress: number) => void;

interface VideoJobResponse {
  job_id: string;
}

interface JobStatusResponse {
  status: 'completed' | 'failed' | 'processing';
  videoUrl?: string;
  error?: string;
  progress?: number;
}

export const generateVideo = async (
  query: string,
  subscription?: 'free' | 'pro' | null,
  onProgress?: ProgressCallback
): Promise<string> => {
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
    throw new Error('Backend URL not configured');
  }

  const jobId = await initiateVideoRequest(query, subscription);
  return pollForStatus(jobId, onProgress);
};

const initiateVideoRequest = async (
  query: string,
  subscription?: 'free' | 'pro' | null
): Promise<string> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      is_pro: subscription === 'pro'
    })
  });

  if (!response.ok) {
    console.error('[Video Generation] Failed to initiate video generation');
    throw new Error('Failed to start video generation');
  }

  const data = await response.json() as VideoJobResponse;
  return data.job_id;
};

const pollForStatus = async (
  jobId: string,
  onProgress?: ProgressCallback
): Promise<string> => {
  const pollInterval = 2000;
  const maxAttempts = 150;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job-status/${jobId}`);
    
    if (!statusResponse.ok) {
      if (statusResponse.status === 404) {
        console.error(`[Video Generation] Job ${jobId} not found`);
        throw new Error('Job not found');
      }
      console.error(`[Video Generation] Failed to fetch status for job ${jobId}`);
      throw new Error('Failed to fetch job status');
    }

    const jobData = await statusResponse.json() as JobStatusResponse;

    if (jobData.status === 'completed' && jobData.videoUrl) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/${jobData.videoUrl}`;
    }

    if (jobData.status === 'failed') {
      console.error(`[Video Generation] Job ${jobId} failed:`, jobData.error);
      throw new Error(jobData.error || 'Video generation failed');
    }

    // Update progress if available
    if (typeof jobData.progress === 'number' && jobData.progress >= 0 && jobData.progress <= 100 && onProgress) {
      onProgress(jobData.progress);
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    attempts++;
  }

  console.error(`[Video Generation] Job ${jobId} timed out after ${maxAttempts} attempts`);
  throw new Error('Video generation timed out after 5 minutes');
};

