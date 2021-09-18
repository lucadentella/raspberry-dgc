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
GPIO.setmode(GPIO.BCM)
GPIO.setup(2, GPIO.OUT)
GPIO.setup(3, GPIO.OUT)
GPIO.output(2, GPIO.LOW)
GPIO.output(3, GPIO.LOW)
print("GPIO configured");

# Initialise Raspberry Pi camera
camera = PiCamera()
camera.resolution = (640, 480)

# set up stream buffer
rawCapture = PiRGBArray(camera, size=RESOLUTION)

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
        print(payload)
        r = requests.get('http://localhost:3000/', params=payload)
        print('Return code: ', r.status_code, ', Text: ', r.text)
		
		# turn on the LEDs for 2 seconds
		if r.status_code == 200: pin = 2
        else: pin = 3
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
