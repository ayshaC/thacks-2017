import io
import random
import picamera
import subprocess
from subprocess import call

def drowsiness_detected():
    # Randomly return True (like a fake motion detection routine)
    return random.randint(0, 5) == 0

camera = picamera.PiCamera()
stream = picamera.PiCameraCircularIO(camera, seconds=15)
camera.start_recording(stream, format='h264')
try:
    while True:
        camera.wait_recording(1)
        if drowsiness_detected():
            # Keep recording for 10 seconds and only then write the
            # stream to disk
            print 'recording'
            camera.wait_recording(5)
            stream.copy_to('clip.h264')
            call(['MP4Box','-fps','30','-add','clip.h264','clip.mp4'])
finally:
    camera.stop_recording()

