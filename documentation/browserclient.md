# browserClient :globe_with_meridians:

The project includes a client, developed in HTML/Javascript, that can run in a browser.

The browserClient can scan a qrcode, send the base45 string to validatorServer and display the result.

You can serve the browserClient from the same Raspberry Pi that runs validatorServer: this is the easiest way to use it but not the only one!

Remember that, to be able to access the webcam, the client must be served with **HTTPS** protocol. This requires that also validatorServer is listening with the same protocol. Here I'm using the *proxy_pass* feature of nginx for this.

**1. Install an HTTP server**

    sudo apt-get install nginx-light -y

**1a. Verify that nginx is up and running**

![](https://github.com/lucadentella/raspberry-dgc/raw/main/images/nginx.png)

**1b. Enable HTTPS**

	sudo nano /etc/nginx/sites-enabled/default

![](https://github.com/lucadentella/raspberry-dgc/raw/main/images/nginx-ssl.png)

**1c. Enable ProxyPass to expose the validatorServer in HTTPS**

	sudo nano /etc/nginx/sites-enabled/default

![](https://github.com/lucadentella/raspberry-dgc/raw/main/images/nginx-proxy.png)

**1d. Restart nginx**

	sudo systemctl restart nginx.service

**2. Clone the Github repository and copy the browserClient files**

    cd ~
	git clone https://github.com/lucadentella/raspberry-dgc
	cd raspberry-dgc/
	sudo cp -r browserClient/ /var/www/html/

**3. Change the validatorServer URL** 

	cd /var/www/html/browserClient/
	sudo nano index.html
	
![](https://github.com/lucadentella/raspberry-dgc/raw/main/images/server-url.png)

**4. Test**

	https://raspberrypi.local/browserClient/
	
![](https://github.com/lucadentella/raspberry-dgc/raw/main/images/browserclient-test.png)


