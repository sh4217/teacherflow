from fastapi import UploadFile
from typing import Optional, Tuple
from pathlib import Path
import tempfile
import mutagen

# Constants
MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_AUDIO_TYPES = {'audio/mpeg', 'audio/mp3'}
MAX_DURATION_SECONDS = 300  # 5 minutes

def get_audio_duration(file_path: str) -> float:
    """Get the duration of an audio file in seconds.
    
    Args:
        file_path (str): Path to the audio file
        
    Returns:
        float: Duration in seconds, or 5.0 if duration cannot be determined
    """
    try:
        audio = mutagen.File(file_path)
        if audio is None:
            return 5.0  # Default duration if file can't be read
        return float(audio.info.length)
    except Exception:
        return 5.0  # Default duration if there's an error

def validate_audio_file(file: UploadFile) -> Tuple[bool, Optional[str]]:
    """
    Validate audio file format, size, and integrity.
    
    Args:
        file (UploadFile): The uploaded audio file to validate
        
    Returns:
        Tuple[bool, Optional[str]]: A tuple containing:
            - bool: Whether the file is valid
            - Optional[str]: Error message if invalid, None if valid
    """
    try:
        # Check content type
        if file.content_type not in ALLOWED_AUDIO_TYPES:
            return False, f"Invalid audio format. Allowed types: {', '.join(ALLOWED_AUDIO_TYPES)}"
        
        # Read file content
        content = file.file.read()
        file.file.seek(0)  # Reset file pointer
        
        # Check file size
        if len(content) > MAX_AUDIO_SIZE_BYTES:
            return False, f"Audio file too large. Maximum size: {MAX_AUDIO_SIZE_BYTES/1024/1024}MB"
        
        # Write to temporary file for format validation
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            # Validate audio file integrity
            audio = mutagen.File(temp_path)
            if audio is None:
                return False, "Invalid audio file format or corrupted file"
            
            # Get duration if available
            duration = getattr(audio.info, 'length', None)
            if duration and duration > MAX_DURATION_SECONDS:
                return False, f"Audio file too long. Maximum duration: {MAX_DURATION_SECONDS/60} minutes"
                
            return True, None
        finally:
            Path(temp_path).unlink()
            
    except Exception as e:
        return False, f"Error validating audio: {str(e)}" 