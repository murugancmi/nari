/*All browser standard*/
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition ||
    window.msSpeechRecognition || window.oSpeechRecognition;

var self;

function nari() {
    self = this;
    var self = this;
    self.socket = {}
    self.rtc = false;
    self.username = null;
    self.iceservers = {
        'iceServers': [{
                'url': 'stun:stun.services.mozilla.com'
            },
            {
                'url': 'stun:stun.l.google.com:19302'
            }, {
                url: 'turn: numb.viagenie.ca',
                credential: '28510351',
                username: 'murugan@telecmi.com'
            }
        ]
    };

    var socket = new io('http://192.168.1.5:8989');
    /*
     Websocket socket Related Operation for signalling
    */
    self.startSig = function(username) {

        //Socket connect event
        socket.on('connect', function() {
                self.socket = socket;
                self.onFire({
                    event: 'connect',
                    status: true
                })
                self.socketRegister(username);
            })
            //socket disconnect event
        socket.on('disconnect', function() {
                self.socket = {};
                socket.connect()
                self.onFire({
                    event: 'disconnected',
                    status: true
                })
            })
            //socket error event
        socket.on('error', function() {
            self.socket = {};
            socket.connect();
            self.onFire({
                event: 'disconnected',
                status: true
            })
        })

        //user register success fully
        socket.on('ack', function(data) {
            if (data.code == 200) {
                self.socket.registered = true;
                self.onFire({
                    event: 'register',
                    status: true
                })
            } else if (data.code == 404) {
                self.onFire({
                    event: 'register',
                    status: false,
                    code: 404
                })
            } else if (data.code == 504) {
                self.onFire({
                    event: 'msg',
                    status: false,
                    desc: "Param missing"
                })
            } else if (data.code == 707) {
                self.onFire({
                    event: 'msg',
                    status: false,
                    desc: "offline",
                    user: data.user
                })
            } else if (data.code == 909) {
                self.stopStream();
                self.rtc = false;
                self.onRTC({
                    event: 'msg',
                    status: false,
                    desc: "offline",
                    user: data.user
                })
            } else if (data.code == 990) {
                self.stopStream();
                self.rtc = false;
                self.onRTC({
                    event: 'busy',
                    status: 'busy',
                    from: data.from
                })
            }
        })

        socket.on('sdpmsg', function(data) {
            if (data.code == 434) {
                if (self.rtc) {
                    self.send({
                        to: data.from,
                        msg: 'busy',
                        status: 'busy',
                        event: 'media',
                        code: 990
                    })
                    return;
                }
                self.to = data.from;
                self.mediain = data.media;
                self.rtc = true;
                self.onRTC({
                    event: 'invite',
                    status: 'invite',
                    from: data.from,
                    media: self.media
                })
            } else if (data.code == 990) {
                self.stopStream();
                self.rtc = false;
                self.onRTC({
                    event: 'busy',
                    status: 'busy',
                    from: data.from
                })
            } else if (data.code == 880) {
                self.peer();
                self.onRTC({
                    event: 'trying',
                    status: 'trying',
                    from: data.from
                })
            } else if (data.code == 543) {
                self.onRTC({
                    event: 'ringing',
                    status: 'ringing',
                    from: data.from
                })
                self.answer(data.sdp)
            } else if (data.code == 345) {

                self.rtcpeer.setRemoteDescription(new RTCSessionDescription(data.sdp))
            } else if (data.code == 224) {
                self.rtcpeer.addIceCandidate(new RTCIceCandidate(data.candidate))
            } else if (data.code == 016) {
                if ((self.to) && (self.media)) {
                    self.stopStream();
                    self.rtc = false;
                    self.to = null;
                    self.mediain = null;
                } else {
                    self.stopStream();
                    self.rtc = false;
                }
            }

            //Data Channel Signalling
            if (data.code == 0434) {
                self.dto = data.from;
                self.channeloffer();

            } else if (data.code == 0543) {

                self.remotechannelpeer();
                self.channelanswer(data.sdp)
            } else if (data.code == 0345) {

                self.dpeer.setRemoteDescription(new RTCSessionDescription(data.sdp))
            } else if (data.code == 0224) {

                self.dpeer.addIceCandidate(new RTCIceCandidate(data.candidate))
            }




        })

    }


    //send message to other peer
    self.send = function(msg) {
        if ((msg.to) && (msg.msg)) {
            msg.from = self.username;
            socket.emit('msg', msg)
        } else {
            self.onFire({
                event: 'msg',
                status: false,
                desc: 'it should contain field to and msg'
            })
        }
    }

    //socketregister event
    self.socketRegister = function(username) {
        if (username) {
            self.username = username;
            socket.emit('register', {
                userid: username
            })

        } else {
            self.onFire({
                event: 'connect',
                status: false,
                desc: 'username require'
            })
        }

    }
}

/*
  Accept incoming call
*/

nari.prototype.accept = function() {
    var self = this;
    if ((self.to) && (self.media)) {
        self.send({
            to: self.to,
            msg: 'trying',
            status: 'trying',
            event: 'media',
            code: 880
        });
        self.offer();
    } else {

        self.stopStream();
        self.rtc = false;
    }
}


nari.prototype.reject = function() {
    var self = this;
    if ((self.to) && (self.media)) {
        self.stopStream();
        self.rtc = false;
        self.send({
            to: self.to,
            msg: 'busy',
            status: 'busy',
            event: 'media',
            code: 990
        })
        self.to = null;
        self.mediain = null;
    } else {
        self.stopStream();
        self.rtc = false;
    }
}

/*
  Register with signalling server
  {username: 'uniqueID'}
*/
nari.prototype.register = function(username) {
    var self = this;

    if (username) {
        self.startSig(username);
    } else {
        self.onFire({
            event: 'connect',
            status: false,
            desc: 'username required'
        })
    }
}

/*
  Socket related Event
  {@event: 'JSON'@
    {event:String,Status:boolean,desc:String}
    }
*/
nari.prototype.onFire = function(event) {};

/*
  RTC related Event
  {@event: 'JSON'@
    {event:String,Status:boolean,desc:String}
    }
*/
nari.prototype.onRTC = function(event) {};




/*
  RTC related Operation
*/
nari.prototype.rtc = function() {
    var self = this;
    self.rtc = new webkitRTC
}


/*
  Getuser usermedia audio or video
*/
nari.prototype.media = function(audio, video, callback) {
    var self = this;
    var audio = audio || true;
    var video = video || false;

    navigator.getUserMedia({
        "audio": audio,
        "video": video
    }, function(stream) {
        self.onlocalstream(stream);
        self.localstream = stream;
        callback(true, null)
    }, function(error) {
        self.onRTC({
            event: 'Media',
            status: "deny",
            desc: error,
            code: 909
        })
        callback(null, true)
    });

}


/*
 Create Peer Object for RTC
 */
nari.prototype.peer = function() {
    var self = this;
    self.rtcpeer = new RTCPeerConnection(self.iceservers);
    self.rtcpeer.onicecandidate = function(data) {
        if (!data || !data.candidate) return;
        self.send({
            to: self.to,
            event: 'Media',
            candidate: data.candidate,
            msg: 'candidate',
            status: 'candidate',
            code: 224
        })
    };
    self.rtcpeer.onaddstream = self.onremotestream;

    self.rtcpeer.oniceconnectionstatechange = function(state) {

        if ((state.currentTarget.iceConnectionState == "closed") || (state.currentTarget.iceConnectionState == "disconnected")) {
            self.endCall();
        }

        self.onRTC({
            event: 'peer',
            status: state.currentTarget.iceConnectionState
        })
    };
    self.rtcpeer.onsignalingstatechange = function(state) {

        if ((state.currentTarget.iceConnectionState == "closed") || (state.currentTarget.iceConnectionState == "disconnected")) {
            self.endCall();
        }

        self.onRTC({
            event: 'peer',
            status: state.currentTarget.iceConnectionState
        })
    };

    self.rtcpeer.addStream(self.localstream);
}





//End Peer
nari.prototype.endCall = function() {
    var self = this;
    if ((self.to) && (self.media)) {
        self.stopStream();
        self.rtc = false;
        self.rtcpeer.close();
        self.send({
            to: self.to,
            msg: 'bye',
            status: 'bye',
            event: 'media',
            code: 016
        })
        self.to = null;
        self.mediain = null;
    } else {
        self.stopStream();
        self.rtc = false;
    }
}


/*
 Create offer for making calls
 */
nari.prototype.offer = function() {
    var self = this;

    var audio = self.mediain.audio || true;
    var video = self.mediain.video || false;
    self.media(audio, video, function(success, error) {

        if (success) {
            self.peer()
            self.rtcpeer.createOffer(function(offer) {
                var offer = new RTCSessionDescription(offer);
                self.rtcpeer.setLocalDescription(offer, function() {
                    self.send({
                        to: self.to,
                        event: 'Media',
                        sdp: offer,
                        code: 543,
                        status: 'offer',
                        msg: 'offer'
                    })
                }, function(error) {
                    self.onRTC({
                        event: 'Media',
                        status: "deny",
                        desc: error
                    })
                    self.reject();
                })
            }, function(error) {
                self.onRTC({
                    event: 'Media',
                    status: "deny",
                    desc: error
                })
                self.reject();

            })
        } else {
            self.reject();
        }
    })
}


/*
 Create Answer  for receving calls
 */
nari.prototype.answer = function(sdp) {
    var self = this
    self.rtcpeer.setRemoteDescription(new RTCSessionDescription(sdp));
    self.rtcpeer.createAnswer(function(answer) {
        var ans = new RTCSessionDescription(answer);
        self.rtcpeer.setLocalDescription(ans, function() {
            self.send({
                to: self.to,
                event: 'Media',
                sdp: ans,
                code: 345,
                status: 'answer',
                msg: 'answer'
            })
        }, function(error) {
            self.onRTC({
                event: 'Media',
                status: "deny",
                desc: error
            })
            self.reject();
        })
    }, function(error) {
        self.onRTC({
            event: 'Media',
            status: "deny",
            desc: error
        })
        self.reject();
    })
}




/*
Remote stream
*/

nari.prototype.onremotestream = function(stream) {

}

/*
Localstream stream
*/
nari.prototype.onlocalstream = function(stream) {

}

/*
 Make Audio Call
*/
nari.prototype.audioCall = function(to) {
    var self = this;
    if (!to) {
        self.onRTC({
            event: 'Media',
            status: "deny",
            desc: 'userid required'
        });
        return;
    }
    if (self.rtc) {
        self.onRTC({
            event: 'Media',
            status: "deny",
            desc: 'You already in other call'
        })
        return;
    }
    self.rtc = true;
    self.to = to;
    //Get usermedia
    self.media(true, false, function(success, error) {
        if (success) {
            self.send({
                to: to,
                msg: 'invite',
                status: 'invite',
                event: 'media',
                code: 434,
                media: {
                    audio: true,
                    video: false
                }
            })
        } else {
            self.rtc = false;
        }
    })
}

nari.prototype.videoCall = function(to) {
    var self = this;
    if (!to) {
        self.onRTC({
            event: 'Media',
            status: "deny",
            desc: 'userid required'
        });
        return;
    }
    if (self.rtc) {
        self.onRTC({
            event: 'Media',
            status: "deny",
            desc: 'You already in other call'
        })
        return;
    }
    self.rtc = true;
    self.to = to;
    //Get usermedia
    self.media(true, true, function(success, error) {
        if (success) {
            self.send({
                to: to,
                msg: 'invite',
                status: 'invite',
                event: 'media',
                code: 434,
                media: {
                    audio: true,
                    video: true
                }
            })
        } else {
            self.rtc = false;
        }
    })
}


/*
Stop media devices stream
*/
nari.prototype.stopStream = function() {
    var self = this;
    if (self.localstream) {
        self.localstream.getTracks().forEach(function(track) {
            track.stop();
        });
    }
}


/*
Hanghup Call
*/
nari.prototype.bye = function() {
    var self = this;
    self.endCall()
}


/*
Pause and Play video call
*/

nari.prototype.videotoggle = function() {
    var self = this
    if (!self.localstream) {
        return
    }
    if (!self.localstream.getVideoTracks()) {
        return
    }

    if (self.localstream.getVideoTracks()[0].enabled) {
        self.localstream.getVideoTracks()[0].enabled = false
    } else {
        self.localstream.getVideoTracks()[0].enabled = true
    }
}



/*
Mute and Unmute Audio call
*/

nari.prototype.audiotoggle = function() {
    var self = this

    if (!self.localstream) {
        return
    }
    if (!self.localstream.getAudioTracks()) {
        retrun
    }
    if (self.localstream.getAudioTracks()[0].enabled) {

        self.localstream.getAudioTracks()[0].enabled = false
    } else {

        self.localstream.getAudioTracks()[0].enabled = true
    }
}