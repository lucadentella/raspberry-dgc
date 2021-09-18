from picamera.array import PiRGBArray
from picamera import PiCamera
from RPi import GPIO
import time
import sys
import cv2
import zbarlight
import requests
from PIL import Image

# Initialise GPIO
RED_LED = 2
GREEN_LED = 3
GPIO.setmode(GPIO.BCM)
GPIO.setup(RED_LED, GPIO.OUT)
GPIO.setup(GREEN_LED, GPIO.OUT)
GPIO.output(RED_LED, GPIO.LOW)
GPIO.output(GREEN_LED, GPIO.LOW)
print("GPIO configured");

# Initialise Raspberry Pi camera
RESOLUTION = (480, 272)
camera = PiCamera()
camera.resolution = RESOLUTION

# set up stream buffer
rawCapture = PiRGBArray(camera, size = RESOLUTION)

# allow camera to warm up
time.sleep(0.1)
print("cameraClient ready")

# Initialise OpenCV window
cv2.namedWindow("raspberry-dgc")
print("OpenCV window ready")

# Capture frames from the camera
for frame in camera.capture_continuous(rawCapture, format = "bgr", use_video_port = True):
    
    # as raw NumPy array
    output = frame.array.copy()

    # raw detection code
    gray = cv2.cvtColor(output, cv2.COLOR_BGR2GRAY, dstCn=0)
    pil = Image.fromarray(gray)
    width, height = pil.size
    raw = pil.tobytes()

    # create a reader
    codes = zbarlight.scan_codes(['qrcode'], pil)
    
    # if a qrcode was found, call validatorServer
    if codes is not None:

        payload = {'dgc': codes[0]}
        r = requests.get('http://localhost:3000/', params=payload)
        print('Return code: ', r.status_code, ', Text: ', r.text)
        
        # turn on the LEDs for 2 seconds
        if r.status_code == 200: pin = GREEN_LED
        else: pin = RED_LED
        GPIO.output(pin, GPIO.HIGH)
        time.sleep(2)
        GPIO.output(pin, GPIO.LOW)

    # show the frame
    cv2.imshow("raspberry-dgc", output)

    # clear stream for next frame
    rawCapture.truncate(0)
    
    # Wait for Q to quit
    keypress = cv2.waitKey(1) & 0xFF
    if keypress == ord('q'):
        break

# When everything is done, release the capture
camera.close()
cv2.destroyAllWindows()
