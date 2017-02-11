# WebRTC Scalable Platform For Browser,Desktop,Mobile and IOT
NARI Provides complete Scalable and easy to use API for Browser,Mobile,Desktop and IOT build top on WebRTC,NARI Supports many rich features,Here is a list of the options available.And NARI support SFU(Multi user Conference),PSTN and Live Streaming(Youtube,Facebook).This easy to use platform is powered by
[TeleCMI Technologies Private Limited](https://telecmi.com/).
### Supported Features

1. One-to-One Video Call
2. One-to-One Audio Call
3. One-to-One Chat
4. One-to-One Filesharing
5. Scalable server (Multi Datacenter)



### Get Started

#### Installation
Installing NARI is quite a simple experience. we recommend Debian/Ubuntu Operating Systems.

On Debian/Ubuntu systems,Install required package NodeJS and NPM:

```shell
sudo apt-get install nodejs git npm nodejs-legacy
git clone https://github.com/murugancmi/nari.git
cd nari
npm install
```
Edit signalling server [URL](https://github.com/murugancmi/nari/blob/master/src/cmiRTC.js#L28)
```shell
grunt 
node server.js
```
Open bellow two URL if defferent tab
User 1:
http://localhost:8080

User 2:
http://localhost:8080/murugan


Now you can check demo


### Roadmap
##### Support SFU
##### Support SIP and PSTN
##### Support Live Streaming to Facebook and Youtube
##### Support react-native(Android and IOS)(progress)
##### Support Cordova(Android and IOS)


### Developer Documnet
#### [Browser SDK ](https://github.com/murugancmi/nari/wiki/browser)
#### [Scalable Server ](https://github.com/murugancmi/nari/wiki/Nari-server-Installation)

