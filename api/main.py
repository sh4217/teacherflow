from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uuid import uuid4
from typing import Optional
from pathlib import Path
from manim import *
import tempfile
import shutil

from audio_validation import validate_audio_file

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
    def __init__(self, text: str, audio_path: Optional[str] = None):
        super().__init__()
        self.text = text
        self.audio_path = audio_path
        self.has_audio = audio_path is not None

    def construct(self):
        # Add the text animation
        label = Text(self.text)
        self.add(label)
        
        if self.has_audio:
            try:
                # Add the audio narration
                self.add_sound(self.audio_path)
                # Wait for the duration of the audio
                self.wait()
            except Exception as e:
                # If audio fails, fall back to default duration
                self.wait(5)  # Default 5 second duration
        else:
            # No audio, use default duration
            self.wait(5)  # Default 5 second duration

@app.post("/generate-video")
async def generate_video(
    text: str = Form(...),
    audio: Optional[UploadFile] = File(None)
):
    temp_audio_path = None
    try:
        # Create videos directory if it doesn't exist
        VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename using UUID
        video_filename = f"{uuid4()}.mp4"
        video_path = VIDEOS_DIR / video_filename
        
        if audio:
            # Validate audio file
            is_valid, error_message = validate_audio_file(audio)
            if not is_valid:
                raise HTTPException(status_code=400, detail=error_message)
            
            # Save valid audio to a temporary file
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
            
            # Create and render the scene with the provided text and optional audio
            scene = Script(text, temp_audio_path)
            scene.render()
            
            # Find the generated video
            generated_video = Path(temp_dir) / "videos" / "720p30" / "animation.mp4"
            if not generated_video.exists():
                raise Exception("Video file not generated")
                
            # Copy the video to the final destination
            shutil.copy(generated_video, video_path)
        
        return JSONResponse({
            "success": True,
            "videoUrl": f"/generated-videos/{video_filename}"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp audio file if it exists
        if temp_audio_path:
            try:
                Path(temp_audio_path).unlink()
            except Exception:
                pass  # Ignore cleanup errors

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 