# Installation :floppy_disk:

**0. Upgrade the raspbian distribution**

    sudo apt update
    sudo apt upgrade
    sudo reboot

**1. Enable the Pi Camera**

    sudo raspi-config

**2. Install Python libraries** 

	sudo apt-get install python3-opencv libzbar0 libzbar-dev
	sudo apt-get install libqt4-test python3-sip python3-pyqt5 libqtgui4 libjasper-dev libatlas-base-dev
	pip3 install opencv-contrib-python zbarlight

**3. Clone the Github repository**

	sudo git clone https://github.com/lucadentella/raspberry-dgc

**4. Install NodeJS libraries**

    cd validatorServer
	npm install

**5. Run the applications**

    cd validatorServer
	node app.js
	
	cd cameraClient
	python3 cameraClient.py
