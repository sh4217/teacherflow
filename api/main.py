from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
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

class CircleToSquare(Scene):
    def construct(self):
        blue_circle = Circle(color=BLUE, fill_opacity=0.5)
        green_square = Square(color=GREEN, fill_opacity=0.8)
        self.play(Create(blue_circle))
        self.wait()
        
        self.play(Transform(blue_circle, green_square))
        self.wait()

@app.post("/generate-video")
async def generate_video():
    try:
        # Create videos directory if it doesn't exist
        VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Use fixed filename instead of UUID
        video_filename = "manim.mp4"
        video_path = VIDEOS_DIR / video_filename
        
        # Create a temporary directory for Manim output
        with tempfile.TemporaryDirectory() as temp_dir:
            # Configure Manim
            config.media_dir = temp_dir
            config.quality = "medium_quality"
            config.output_file = "animation"
            
            # Create and render the scene
            scene = CircleToSquare()
            scene.render()
            
            # Find the generated video
            generated_video = Path(temp_dir) / "videos" / "720p30" / "animation.mp4"
            if generated_video.exists():
                shutil.copy(generated_video, video_path)
            else:
                raise Exception("Video file not generated")
        
        return JSONResponse({
            "success": True,
            "videoUrl": f"/generated-videos/{video_filename}"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 