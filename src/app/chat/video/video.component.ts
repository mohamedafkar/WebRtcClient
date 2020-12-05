import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { HubConnectionState } from "@microsoft/signalr/dist/esm/HubConnection";
import { ConnectService } from "src/app/Services/connect.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-video",
  templateUrl: "./video.component.html",
  styleUrls: ["./video.component.css"],
})
export class VideoComponent implements OnInit, OnDestroy {
  peerConnectionConfig: RTCConfiguration = {
    iceServers: environment.iceServers,
  };
  peer: RTCPeerConnection;

  @Input("test") test: string;

  userName: string = "A";
  users: any = [];
  currentUser: string;
  targetUser: any;

  mediaDevices = navigator.mediaDevices as any;
  mediaRecorder: any;
  videoConstraints: any = {};
  audioConstraints: any = {};
  localVideo: any;
  remoteVideo: any;
  ringtoneEl: any;
  localStream: any;
  isAudio = true;
  isVideo = true;
  answerButtonhidden: boolean = true;
  cancelButtonhidden: boolean = true;
  hangupButtonhidden: boolean = true;

  constructor(private connectService: ConnectService) {}
  ngOnDestroy(): void {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }
  }

  ngOnInit() {
    debugger;
    this.test;
    var that = this;
    this.videoConstraints = {
      frameRate: 25,
      video: true,
    };
    this.audioConstraints = {
      sampleRate: 48000,
      sampleSize: 16,
      channelCount: 2,
      echoCancellation: true,
      audio: true,
    };
    that.localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    this.localVideo.volume = 0;
    that.remoteVideo = document.getElementById(
      "remoteVideo"
    ) as HTMLVideoElement;
    that.ringtoneEl = document.getElementById("ringtone") as HTMLAudioElement;

    this.call();

    this.connectService.connection.on(
      "SendConnectionId",
      (connectionId: any) => {
        sessionStorage.setItem("connectionId", connectionId);
        that.currentUser = connectionId;
      }
    );

    this.connectService.connection.on("updateUserList", (userList: any) => {
      var connectionId = sessionStorage.getItem("connectionId");
      this.users = [];
      userList.forEach((element: any) => {
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
      this.targetUser = user;
      this.ringtoneEl.play();
      this.answerButtonhidden = false;
      this.cancelButtonhidden = false;
    });

    this.connectService.connection.on("CallAccepted", (targetUser: any) => {
      this.ringtoneEl.currentTime = 0;
      this.ringtoneEl.pause();
      this.hangupButtonhidden = false;
      this.createOffer(targetUser);
    });

    this.connectService.connection.on(
      "CallDeclined",
      (decliningUser: any, massage: any) => {
        this.ringtoneEl.currentTime = 0;
        this.ringtoneEl.pause();
        this.answerButtonhidden = true;
        this.hangupButtonhidden = true;
        this.cancelButtonhidden = true;
        alert(massage);
      }
    );

    this.connectService.connection.on(
      "CallEnded",
      (callingUser: any, massage: any) => {
        this.answerButtonhidden = true;
        this.hangupButtonhidden = true;
        this.cancelButtonhidden = true;
        this.remoteVideo.srcObject = null;
        if (this.peer) {
          this.peer.close();
          this.peer = null;
        }
        alert(massage);
      }
    );

    this.connectService.connection.on("OfferBack", (targetOffer: string) => {
      var obj = JSON.parse(targetOffer);
      this.handleRecieveCall(obj);
    });
    this.connectService.connection.on("AnswerBack", (targetOffer: string) => {
      var obj = JSON.parse(targetOffer);
      this.handleAnswer(obj);
    });

    this.connectService.connection.on("IceCandidate", (Candidate: string) => {
      var obj = JSON.parse(Candidate);
      this.iCECandidate(obj);
    });

    this.connectService.start();
  }

  // DisConnect() {
  //   if (this.connectService.connection.state == HubConnectionState.Connected) {
  //     this.connectService.connection.invoke("Disconnected").catch((err) => {
  //       console.error(err);
  //     });
  //   }
  // }

  createOffer(targetUser: any) {
    try {
      this.peer = this.createPeer(targetUser, "offer");
    } catch (error) {
      console.error(error);
    }
  }

  createPeer(targetUser?: any, status?: string) {
    try {
      var that = this;
      const peerConnection = new RTCPeerConnection(this.peerConnectionConfig);

      that.localStream.getTracks().forEach(function (track) {
        peerConnection.addTrack(track, that.localStream);
      });

      peerConnection.onicecandidate = (evt) =>
        this.onicecandidateEvent(evt, targetUser);

      peerConnection.ontrack = (evt) =>
        this.ontrackEvent(evt, this.remoteVideo);

      if (status == "offer") {
        peerConnection.onnegotiationneeded = () =>
          this.onnegotiationneededEvent(targetUser);
      }

      return peerConnection;
    } catch (error) {
      console.error(error);
    }
  }

  onicecandidateEvent(e, targetUser) {
    try {
      if (e && e.candidate) {
        debugger;
        const payload = {
          target: targetUser.connectionId,
          candidate: e.candidate,
        };
        if (
          this.connectService.connection.state == HubConnectionState.Connected
        ) {
          this.connectService.connection
            .invoke(
              "IceCandidate",
              targetUser.connectionId,
              JSON.stringify(payload)
            )
            .catch((err) => {
              console.error(err);
            });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  ontrackEvent(e, remoteStream) {
    try {
      if (!remoteStream) return;

      if (e) {
        console.log("Remote Stream working");
        remoteStream.srcObject = e.streams[0];
        remoteStream.onloadedmetadata = function (e) {
          remoteStream.play();
        };
      }
    } catch (error) {
      console.error(error);
    }
  }

  onnegotiationneededEvent(targetUser: any) {
    try {
      var that = this;
      this.peer
        .createOffer()
        .then((offer) => {
          return that.peer.setLocalDescription(offer);
        })
        .then(() => {
          const payload = {
            target: targetUser.connectionId,
            caller: that.currentUser,
            sdp: that.peer.localDescription,
          };
          if (
            that.connectService.connection.state == HubConnectionState.Connected
          ) {
            that.connectService.connection
              .invoke(
                "Offer",
                that.targetUser.connectionId,
                JSON.stringify(payload)
              )
              .catch((err) => {
                console.error(err);
              });
          }
        })
        .catch((e) => console.log(e));
    } catch (error) {
      console.error(error);
    }
  }

  async handleRecieveCall(targetOffer: any) {
    try {
      debugger;
      var that = this;
      this.peer = this.createPeer(this.targetUser, "answer");
      const desc = new RTCSessionDescription(targetOffer.sdp);
      // //new
      // // If you get an offer, you need to reply with an answer.
      // if (desc.type == "offer") {
      //   debugger;
      //   await this.peer.setRemoteDescription(desc);

      //   // const stream = await navigator.mediaDevices.getUserMedia({
      //   //   video: this.videoConstraints,
      //   //   audio: this.audioConstraints,
      //   // });
      //   // stream
      //   //   .getTracks()
      //   //   .forEach((track) => this.peer.addTrack(track, stream));

      //   await this.peer.setLocalDescription(await this.peer.createAnswer());

      //   const payload = {
      //     target: that.targetUser.connectionId,
      //     caller: that.currentUser,
      //     sdp: that.peer.localDescription,
      //   };
      //   //socketRef.current.emit("answer", payload);
      //   if (
      //     that.connectService.connection.state == HubConnectionState.Connected
      //   ) {
      //     that.connectService.connection
      //       .invoke(
      //         "AnswerOffer",
      //         that.targetUser.connectionId,
      //         JSON.stringify(payload)
      //       )
      //       .catch((err) => {
      //         console.error(err);
      //       });
      //   }
      // } else if (desc.type == "answer") {
      //   debugger;
      //   await this.peer.setRemoteDescription(desc);
      // } else {
      //   console.log("Unsupported SDP type.");
      // }
      // //new

      this.peer
        .setRemoteDescription(desc)
        .then(() => {
          // that.localStream
          //   .getTracks()
          //   .forEach((track) => that.peer.addTrack(track, that.localStream));
        })
        .then(() => {
          return this.peer.createAnswer();
        })
        .then((answer) => {
          return this.peer.setLocalDescription(answer);
        })
        .then(() => {
          const payload = {
            target: that.targetUser.connectionId,
            caller: that.currentUser,
            sdp: that.peer.localDescription,
          };
          if (
            that.connectService.connection.state == HubConnectionState.Connected
          ) {
            that.connectService.connection
              .invoke(
                "AnswerOffer",
                that.targetUser.connectionId,
                JSON.stringify(payload)
              )
              .catch((err) => {
                console.error(err);
              });
          }
        });
    } catch (error) {
      console.error(error);
    }
  }

  handleAnswer(CallerOffer: any) {
    try {
      const desc = new RTCSessionDescription(CallerOffer.sdp);
      this.peer.setRemoteDescription(desc).catch((e) => console.log(e));
    } catch (error) {
      console.error(error);
    }
  }

  iCECandidate(candidate: any) {
    try {
      var that = this;
      let myCandidate = new RTCIceCandidate(candidate.candidate);
      that.peer.addIceCandidate(myCandidate).catch((e) => console.error(e));
    } catch (error) {
      console.error(error);
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
      this.ringtoneEl.play();
      this.connectService.connection.invoke("CallUser", user).catch((err) => {
        console.error(err);
      });
    }
  }

  answerCall(targetUser: any) {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      //this.call();
      this.ringtoneEl.currentTime = 0;
      this.ringtoneEl.pause();
      this.answerButtonhidden = true;
      this.hangupButtonhidden = false;
      this.cancelButtonhidden = true;
      this.connectService.connection
        .invoke("AnswerCall", true, targetUser)
        .catch((err) => {
          console.error(err);
        });
    }
  }

  cancelCall(callingUser: any) {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      this.ringtoneEl.currentTime = 0;
      this.ringtoneEl.pause();

      this.answerButtonhidden = true;
      this.cancelButtonhidden = true;
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
      this.answerButtonhidden = true;
      this.hangupButtonhidden = true;
      this.cancelButtonhidden = true;

      this.connectService.connection.invoke("HangUp").catch((err) => {
        console.error(err);
      });
    }
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }
    this.hangUpInternal();
  }

  async call() {
    let that = this;
    //video
    if (that.mediaDevices.getUserMedia) {
      that.mediaDevices
        .getUserMedia({
          audio: that.audioConstraints,
          video: that.videoConstraints,
        })
        .then(function (localStream: MediaStream) {
          that.localStream = localStream;
          that.localVideo.srcObject = localStream;
          that.localVideo.onloadedmetadata = function (e) {
            that.localVideo.play();
          };
        })
        .catch(function (err) {
          console.log("Something went wrong! " + err);
        });
    } else {
      console.log("Check your camera connnect");
    }
  }

  async cam() {
    var that = this;
    if (this.mediaDevices && this.mediaDevices.getUserMedia) {
      that.mediaDevices
        .getUserMedia({
          audio: that.audioConstraints,
          video: that.videoConstraints,
        })
        .then(function (localStream: MediaStream) {
          that.localStream = localStream;
          that.localVideo.srcObject = localStream;
          that.localVideo.onloadedmetadata = function (e) {
            that.localVideo.play();
          };

          if (that.peer.connectionState == "connected") {
          }
          that.localStream.getTracks().forEach(function (track) {
            var sender = that.peer.getSenders().find(function (s) {
              return s.track.kind == track.kind;
            });
            sender.replaceTrack(track);
          });
        })
        .catch(function (err) {
          console.log("Something went wrong! " + err);
        });
    } else {
      console.log("Check your camera connnect");
    }
  }

  async shareScreen() {
    //this.hangUpInternal();
    var that = this;
    this.localStream = null;
    if (this.mediaDevices && this.mediaDevices.getUserMedia) {
      this.localStream = await this.mediaDevices.getDisplayMedia({
        audio: that.audioConstraints,
        video: that.videoConstraints,
      });
      this.localVideo.srcObject = this.localStream;

      if (that.peer.connectionState == "connected") {
        this.localStream.getTracks().forEach(function (track) {
          var sender = that.peer.getSenders().find(function (s) {
            return s.track.kind == track.kind;
          });
          sender.replaceTrack(track);
        });
      }
    }
  }

  async hangUpInternal() {
    if (this.localStream != null) {
      // this.localStream.getTracks().map(function (val) {
      //   val.stop();
      // });

      this.remoteVideo.srcObject = null;
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
    // if (this.localStream) {
    //   this.mediaRecorder = new MediaRecorder(this.localStream);
    //   let chunks = [];
    //   this.mediaRecorder.ondataavailable = function (ev) {
    //      this.chunks.push(ev.data);
    //   }
  }
}
