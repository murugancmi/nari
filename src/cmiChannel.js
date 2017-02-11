
/*
 Create Peer Object for RTC
 d-Datachannel
 */
 nari.prototype.channelpeer=function()
 {
   var self=this;
 self.dpeer = new RTCPeerConnection(self.iceservers);
   var dataChannelParams = {ordered: false};
 self.channel= self.dpeer.createDataChannel("telecmi", dataChannelParams);
//self.channel.binaryType = 'arraybuffer';
self.channel.onerror = function (error) {
self.onChannel({event:'channel',status:"error",desc:error});
};

self.channel.onmessage = function (event) {
  self.onMSG(JSON.parse(event.data))
};

self.channel.onopen = function () {
  self.onChannel({event:'channel',status:"open"});
};

self.channel.onclose = function () {
  self.onChannel({event:'channel',status:"close"});
};
 self.dpeer.onicecandidate=function(data){
   if (!data || !data.candidate) return;
   self.send({to:self.dto,event:'Media',candidate:data.candidate,msg:'candidate',type:'candidate',code:0224})
 };

 self.dpeer.oniceconnectionstatechange=function(state){

   if((state.currentTarget.iceConnectionState=="closed")||(state.currentTarget.iceConnectionState=="disconnected"))
   {
            self.endChannel();
   }

     self.onChannel({event:'channel',status:state.currentTarget.iceConnectionState})
 };
 self.dpeer.onsignalingstatechange=function(state){

   if((state.currentTarget.iceConnectionState=="closed")||(state.currentTarget.iceConnectionState=="disconnected"))
   {
         self.endChannel();
   }

     self.onRTC({event:'peer',status:state.currentTarget.iceConnectionState})
 };
 }


 nari.prototype.remotechannelpeer=function()
 {
   var self=this;
 self.dpeer = new RTCPeerConnection(self.iceservers);
   var dataChannelParams = {ordered: false};
   self.dpeer.ondatachannel=function(event)
   {
     self.channel = event.channel;
     //self.channel.binaryType = 'arraybuffer';
     self.channel.onerror = function (error) {
       self.onChannel({event:'channel',status:"error",desc:error});
     };

     self.channel.onmessage = function (event) {
       self.onMSG(JSON.parse(event.data))
     };

     self.channel.onopen = function () {
       self.onChannel({event:'channel',status:"open"});
     };

     self.channel.onclose = function () {
  self.onChannel({event:'channel',status:"close"});
     };

   }

 self.dpeer.onicecandidate=function(data){
   if (!data || !data.candidate) return;
   self.send({to:self.dto,event:'Media',candidate:data.candidate,msg:'candidate',type:'candidate',code:0224})
 };

 self.dpeer.oniceconnectionstatechange=function(state){

   if((state.currentTarget.iceConnectionState=="closed")||(state.currentTarget.iceConnectionState=="disconnected"))
   {
            self.endChannel();
   }

     self.onChannel({event:'channel',status:state.currentTarget.iceConnectionState})
 };
 self.dpeer.onsignalingstatechange=function(state){

   if((state.currentTarget.iceConnectionState=="closed")||(state.currentTarget.iceConnectionState=="disconnected"))
   {
         self.endChannel();
   }

     self.onRTC({event:'channel',status:state.currentTarget.iceConnectionState})
 };
 }



  nari.prototype.channeloffer=function()
  {
        var self=this;
        self.channelpeer()
        self.dpeer.createOffer(function(offer){
          var offer= new RTCSessionDescription(offer);
          self.dpeer.setLocalDescription(offer,function(){
            self.send({to:self.dto,event:'Media',sdp:offer,code:0543,type:'offer',msg:'offer'})
          },function(error){
            self.onRTC({event:'channel',status:"error",desc:error})
          })
          },function(error){
            self.onRTC({event:'channel',status:"error",desc:error})
          })
  }


  /*
   Create Answer  for receving calls
   */
   nari.prototype.channelanswer=function(sdp)
   {
     var self=this
     self.dpeer.setRemoteDescription(new RTCSessionDescription(sdp));
     self.dpeer.createAnswer(function(answer){
      var ans=new RTCSessionDescription(answer);
       self.dpeer.setLocalDescription(ans,function(){
        self.send({to:self.dto,event:'Media',sdp:ans,code:0345,type:'answer',msg:'answer'})
       },function(error){
         self.onRTC({event:'channel',status:"error",desc:error})
       })
     },function(error){
       self.onRTC({event:'channel',status:"error",desc:error})
     })
   }




   /*
    Make data call
   */
  nari.prototype.dataCall=function(to)
  {
    var self=this;
    if(!to)
    {
      self.onRTC({event:'channel',status:"error",desc:'userid required'});
      return;
    }
    self.dto=to;

    self.send({to:to,msg:'invite',type:'invite',event:'media',code:0434})

  }

  /*
    Receive data channel event
  */
  nari.prototype.onChannel=function(data){}

  /*
    Receive  Message
  */
nari.prototype.onMSG=function(data){}

/*
Send message using data channel
*/
nari.prototype.sendMSG=function(data)
{
  var self=this;
  if(data)
  {
    self.channel.send(JSON.stringify(data))
  }

}
