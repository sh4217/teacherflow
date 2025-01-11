from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from pathlib import Path
from manim import *
import tempfile
import shutil

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to Next.js public/generated-videos directory
VIDEOS_DIR = Path("../public/generated-videos")

class Script(Scene):
    def __init__(self, text: str, audio_path: str):
        super().__init__()
        self.text = text
        self.audio_path = audio_path

    def construct(self):
        # Add the text animation
        label = Text(self.text)
        self.add(label)
        
        # Add the audio narration
        self.add_sound(self.audio_path)
        
        # Wait for the duration of the audio
        self.wait()

@app.post("/generate-video")
async def generate_video(
    text: str = Form(...),
    audio: UploadFile = File(...)
):
    try:
        # Create videos directory if it doesn't exist
        VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Use fixed filename instead of UUID
        video_filename = "manim.mp4"
        video_path = VIDEOS_DIR / video_filename
        
        # Save audio to a temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_audio:
            audio_content = await audio.read()
            temp_audio.write(audio_content)
            temp_audio_path = temp_audio.name

        # Create a temporary directory for Manim output
        with tempfile.TemporaryDirectory() as temp_dir:
            # Configure Manim
            config.media_dir = temp_dir
            config.quality = "medium_quality"
            config.output_file = "animation"
            
            # Create and render the scene with the provided text and audio
            scene = Script(text, temp_audio_path)
            scene.render()
            
            # Find the generated video
            generated_video = Path(temp_dir) / "videos" / "720p30" / "animation.mp4"
            if not generated_video.exists():
                raise Exception("Video file not generated")
                
            # Copy the video to the final destination
            shutil.copy(generated_video, video_path)
            
            # Clean up
            Path(temp_audio_path).unlink()
        
        return JSONResponse({
            "success": True,
            "videoUrl": f"/generated-videos/{video_filename}"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 