# FAQ :question:

## Camera
**How can I increase the camera resolution?**

In `cameraClient.py`edit the following line:

    RESOLUTION  = (480, 272)
	
As explained in the [official documentation](https://picamera.readthedocs.io/en/release-1.13/fov.html#sensor-modes), the Pi’s camera modules have a discrete set of resolutions. If you specify a resolution not in the table, the GPU will select the closer one and then **resize** the frames to the requested resolution.
A higher resolution can improve the qrcode recognition but slow down the validation process. 

**Can I use USB cameras?**

cameraClient currently uses the [picamera Python library](https://picamera.readthedocs.io/).
As explained in the [FAQ](https://picamera.readthedocs.io/en/release-1.13/faq.html#can-i-use-picamera-with-a-usb-webcam):

> No. The picamera library relies on libmmal which is specific to the Pi’s camera module.

cameraClient also includes [OpenCV library](https://pypi.org/project/opencv-python/) for image manipulation. CV2 has a **built-in support** for USB cameras so it should be possible to change the code and use this library instead of picamera. Contributes are welcome!

**Can I see the video in realtime?**

Yes, you can enable the video window uncommenting the following lines (in `cameraClient.py`):

    #cv2.namedWindow("raspberry-dgc")
    ...
    #cv2.imshow("raspberry-dgc", output)
	
If you run cameraClient remotely (SSH connection) you need an **x-server** to view the window. My suggestion, for Windows, is [MobaXterm](https://mobaxterm.mobatek.net/).