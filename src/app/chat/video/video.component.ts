import { Component, OnInit } from "@angular/core";
import { HubConnectionState } from "@microsoft/signalr/dist/esm/HubConnection";
import { ConnectService } from "src/app/Services/connect.service";
import { VideoService } from "src/app/Services/video.service";

//import adapter from "webrtc-adapter";

@Component({
  selector: "app-video",
  templateUrl: "./video.component.html",
  styleUrls: ["./video.component.css"],
})
export class VideoComponent implements OnInit {
  peerConnectionConfig: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  userName: string = "jack";
  userInfo: any = {};
  users: any = [];
  callingUser: any;
  targetUser: any;
  connections: any = [];

  mediaRecorder: any;
  mediaDevices = navigator.mediaDevices as any;
  // @ViewChild("localVideo", { static: false }) localVideo: HTMLVideoElement;
  // @ViewChild("remoteVideo", { static: false }) remoteVideo: HTMLVideoElement;
  localVideo: any;
  remoteVideo: any;
  localStream: any;
  isAudio = true;
  isVideo = true;
  constructor(
    private connectService: ConnectService,
    private videoService: VideoService
  ) {}

  ngOnInit() {
    this.connectService.connection.on(
      "SendConnectionId",
      (connectionId: any) => {
        sessionStorage.setItem("connectionId", connectionId);
      }
    );

    this.connectService.connection.on("updateUserList", (userList: any) => {
      var connectionId = sessionStorage.getItem("connectionId");
      this.users = [];
      userList.forEach((element) => {
        if (connectionId != element.connectionId) {
          this.users.push({
            userName: element.username,
            connectionId: element.connectionId,
            inCall: element.inCall,
          });
        }
      });
    });

    this.connectService.connection.on("IncomingCall", (user: any) => {
      this.callingUser = user;
    });

    this.connectService.connection.on("CallEnded", (massage: any) => {
      alert(massage);
    });

    this.connectService.connection.on(
      "CallDeclined",
      (decliningUser: any, massage: any) => {
        alert(massage);
      }
    );

    this.connectService.connection.on("CallAccepted", (callingUser: any) => {
      this.initiateOffer(callingUser, this.localStream); //jack
    });

    this.connectService.connection.on(
      "CallEnded",
      (callingUser: any, massage: any) => {
        alert(massage);
      }
    );

    this.connectService.connection.on(
      "receiveSignal",
      (signalingUser: any, signal: string) => {
        this.newSignal(signalingUser.connectionId, signal);
      }
    );

    // //afkar
    // this.connectService.connection.on("SendData", (stream: any) => {
    //   debugger;
    //   this.remoteVideo.srcObject = stream;
    //   this.localVideo.onloadedmetadata = function (e) {
    //     this.localVideo.play();
    //   };
    // });

    this.connectService.start();
  }

  DisConnect() {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      this.connectService.connection.invoke("Disconnected").catch((err) => {
        console.error(err);
      });
    }
  }

  connect() {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      this.connectService.connection
        .invoke("Join", this.userName)
        .catch((err) => {
          console.error(err);
        });
    }
  }

  CallUser(userIndex: number) {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      let user = this.users[userIndex];
      this.targetUser = this.users[userIndex];
      this.call();
      this.connectService.connection.invoke("CallUser", user).catch((err) => {
        console.error(err);
      });
    }
  }

  answerCall(targetUser: any) {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      this.connectService.connection
        .invoke("AnswerCall", true, targetUser)
        .catch((err) => {
          console.error(err);
        });
    }
  }

  newSignal(partnerClientId: string, data: string) {
    var signal = JSON.parse(data);
    var connection;
    if (this.connections && this.connections.length > 0) {
      connection = this.connections[partnerClientId];
    } else {
      connection = this.initializeConnection(partnerClientId);
    }

    // Route signal based on type
    if (signal.sdp) {
      console.log("WebRTC: sdp signal");
      this.receivedSdpSignal(connection, partnerClientId, signal.sdp);
    } else if (signal.candidate) {
      console.log("WebRTC: candidate signal");
      this.receivedCandidateSignal(
        connection,
        partnerClientId,
        signal.candidate
      );
    } else {
      console.log("WebRTC: adding null candidate");
      connection.addIceCandidate(
        null,
        () => console.log("WebRTC: added null candidate successfully"),
        () => console.log("WebRTC: cannot add null candidate")
      );
    }
  }

  receivedSdpSignal(connection, partnerClientId: string, sdp: any) {
    var that = this;
    connection.setRemoteDescription(new RTCSessionDescription(sdp), () => {
      if (connection.remoteDescription.type == "offer") {
        connection.addTrack(null, that.localStream); // add our audio/video stream
        connection.createAnswer().then((desc) => {
          connection.setLocalDescription(desc, () => {
            that.sendHubSignal(
              JSON.stringify({ sdp: connection.localDescription }),
              partnerClientId
            );
          });
        });
      } else connection.remoteDescription.type == "answer";
      {
        console.log("WebRTC: remote Description type answer");
      }
    });
  }

  receivedCandidateSignal(connection, partnerClientId: string, candidate) {
    connection.addIceCandidate(
      new RTCIceCandidate(candidate),
      () => console.log("WebRTC: added candidate successfully"),
      () => console.log("WebRTC: cannot add candidate")
    );
  }

  initiateOffer(callingUser: any, stream: MediaStream) {
    var that = this;
    //callingUser //jack the one mm called him
    debugger;
    var connection = this.initializeConnection(callingUser.connectionId); // // get a connection for the given partner
    //connection.addTrack(null, stream); // add our audio/video stream
    stream.getTracks().forEach(function (track) {
      connection.addTrack(track, stream);
    });
    console.log("WebRTC: Added local stream");

    connection
      .createOffer()
      .then((offer) => {
        connection
          .setLocalDescription(offer)
          .then(() => {
            console.log("WebRTC: set Local Description: ");
            console.log("connection before sending offer ", connection);
            setTimeout(() => {
              that.sendHubSignal(
                JSON.stringify({ sdp: connection.localDescription }),
                callingUser.connectionId
              );
            }, 1000);
          })
          .catch((err) =>
            console.error("WebRTC: Error while setting local description", err)
          );
      })
      .catch(function (err) {
        debugger;
        console.log("WebRTC: Error while creating offer " + err);
      });
  }

  sendHubSignal(candidate: string, partnerClientId: string) {
    console.log("candidate", candidate);
    console.log("SignalR: called sendhubsignal ");
    this.connectService.connection
      .invoke("SendSignal", candidate, partnerClientId)
      .catch((err) => console.error("WebRTC: Error while creating offer", err));
  }

  initializeConnection(partnerClientId) {
    var connection = new RTCPeerConnection(this.peerConnectionConfig);

    connection.onicecandidate = (evt) =>
      this.callbackIceCandidate(evt, connection, partnerClientId);

    // Add stream handler callback
    connection.ontrack = (evt) => this.callbackOnTrack(connection, evt);

    // connection.onremovetrack = (evt) =>
    //   this.callbackRemoveStream(connection, evt);

    // Store away the connection based on username
    //
    this.connections.push(partnerClientId);
    return connection;
  }

  //call backs
  // stream removed
  // callbackRemoveStream(connection, evt) {
  //   var otherAudio = document.querySelector(".video.partner");
  //   // otherAudio.objectsrc = "";
  // }
  callbackIceCandidate(evt, connection, partnerClientId) {
    if (evt.candidate) {
      // Found a new candidate
      console.log("WebRTC: new ICE candidate");
      //console.log("evt.candidate: ", evt.candidate);
      this.sendHubSignal(
        JSON.stringify({ candidate: evt.candidate }),
        partnerClientId
      );
    } else {
      // Null candidate means we are done collecting candidates.
      console.log("WebRTC: ICE candidate gathering complete");
      this.sendHubSignal(JSON.stringify({ candidate: null }), partnerClientId);
    }
  }
  callbackOnTrack(connection, evt) {
    // console.log("WebRTC: called callbackAddStream");
    // var myVideo = document.querySelector(".video.mine");
    //myVideo.srcObject = evt.streams[0];;
    debugger;
    this.attachMediaStream(evt);
  }
  attachMediaStream(evt) {
    debugger;
    if ((this.remoteVideo, this.remoteVideo.srcObject !== evt.stream)) {
      this.remoteVideo = evt.stream;
    }
  }
  //

  cancelCall(callingUser: any) {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      var reson = "Busy";
      this.connectService.connection
        .invoke("CallDeclined", callingUser, reson)
        .catch((err) => {
          console.error(err);
        });
    }
  }

  hangUp() {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      this.connectService.connection.invoke("HangUp").catch((err) => {
        console.error(err);
      });
      this.hangUpInternal();
    }
  }
  remoteConnection: string;
  async call() {
    let that = this;
    //defind
    that.localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    that.remoteVideo = document.getElementById(
      "remoteVideo"
    ) as HTMLVideoElement;
    //video
    if (that.mediaDevices.getUserMedia) {
      that.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then(function (localStream: MediaStream) {
          that.localStream = localStream;
          that.localVideo.srcObject = localStream;
          that.localVideo.onloadedmetadata = function (e) {
            that.localVideo.play();
          };
          //afkar
          // debugger;
          // localStream.getVideoTracks().forEach( s => {   });
          // that.connectService.connection
          //   .invoke(
          //     "StreamData",
          //     that.remoteConnection,

          //   )
          //   .catch((err) => {
          //     console.error(err);
          //   });
        })
        .catch(function (err) {
          console.log("Something went wrong! " + err);
        });
    } else {
      console.log("Check your camera connnect");
    }
  }

  async shareScreen() {
    let that = this;
    this.hangUpInternal();
    that.localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    that.remoteVideo = document.getElementById(
      "remoteVideo"
    ) as HTMLVideoElement;
    //share
    if (that.mediaDevices.getUserMedia) {
      this.localStream = await that.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      });
      that.localVideo.srcObject = this.localStream;
    }
  }

  async hangUpInternal() {
    if (this.localStream != null) {
      this.localStream.getTracks().map(function (val) {
        val.stop();
      });
    }
    this.isAudio = true;
    this.isVideo = true;
  }

  async muteAudio() {
    this.isAudio = !this.isAudio;
    this.localStream.getAudioTracks()[0].enabled = this.isAudio;
  }

  async muteVideo() {
    this.isVideo = !this.isVideo;
    this.localStream.getVideoTracks()[0].enabled = this.isVideo;
  }

  async record() {
    let that = this;

    // if (this.localStream) {
    //
    //   var x = this.localStream.captureStream();
    // }

    // if (this.localStream) {
    //   this.mediaRecorder = new MediaRecorder(this.localStream);
    //   //let chunks = [];
    //   this.mediaRecorder.start(500);
    //   this.mediaRecorder.ondataavailable = function (ev) {
    //     //
    //     //that.sendStreamOne({ stream: ev.data });
    //     // var reader = new FileReader();
    //     // reader.readAsDataURL(ev.data);
    //     // reader.onload = reader.onload = readSuccess;
    //     // function readSuccess(evt) {
    //     //
    //     //   that.sendStreamOne({ stream: evt.target.result });
    //     // }
    //     // const blob = this.response;
    //     // const reader = new FileReader();
    //     // reader.onloadend = function (event) {
    //     //   const img = document.createElement("img");
    //     //   //img.src = this.result;
    //     //   document.getElementById("container").appendChild(img);
    //     // };
    //     // reader.readAsDataURL(ev.data);

    //
    //     //this.sleep(100);
    //     //var x = chunks.push(ev.data);
    //   };
  }

  async sleep(msec) {
    return new Promise((resolve) => setTimeout(resolve, msec));
  }
}
