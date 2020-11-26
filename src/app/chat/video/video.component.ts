import { Component, OnInit } from "@angular/core";
import { HubConnectionState } from "@microsoft/signalr/dist/esm/HubConnection";
import { ConnectService } from "src/app/Services/connect.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-video",
  templateUrl: "./video.component.html",
  styleUrls: ["./video.component.css"],
})
export class VideoComponent implements OnInit {
  peerConnectionConfig: RTCConfiguration = {
    iceServers: environment.iceServers,
  };
  userName: string = "A";
  users: any = [];
  currentUser: string;
  targetUser: any;
  peer: RTCPeerConnection;

  mediaRecorder: any;
  mediaDevices = navigator.mediaDevices as any;
  localVideo: any;
  remoteVideo: any;
  localStream: any;
  isAudio = true;
  isVideo = true;
  ringtoneEl: any;
  answerButtonhidden: boolean = true;
  cancelButtonhidden: boolean = true;
  hangupButtonhidden: boolean = true;

  constructor(private connectService: ConnectService) {}

  ngOnInit() {
    var that = this;
    that.localVideo = document.getElementById("localVideo") as HTMLVideoElement;
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
      }
    );

    this.connectService.connection.on(
      "CallEnded",
      (callingUser: any, massage: any) => {
        this.answerButtonhidden = true;
        this.hangupButtonhidden = true;
        this.cancelButtonhidden = true;
        that.remoteVideo.srcObject = null;
        //alert(massage);
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

  DisConnect() {
    if (this.connectService.connection.state == HubConnectionState.Connected) {
      this.connectService.connection.invoke("Disconnected").catch((err) => {
        console.error(err);
      });
    }
  }

  createOffer(targetUser: any) {
    try {
      var that = this;
      this.peer = this.createPeer(targetUser);
      this.localStream.getTracks().forEach(function (track) {
        that.peer.addTrack(track, that.localStream);
      });
    } catch (error) {
      console.error(error);
    }
  }
  createPeer(targetUser?: any) {
    try {
      const peerConnection = new RTCPeerConnection(this.peerConnectionConfig);
      peerConnection.onicecandidate = (evt) =>
        this.handleICECandidateEvent(evt, targetUser);

      peerConnection.ontrack = (evt) =>
        this.handleTrackEvent(evt, this.remoteVideo);
      peerConnection.onnegotiationneeded = () =>
        this.handleNegotiationNeededEvent(targetUser);
      return peerConnection;
    } catch (error) {
      console.error(error);
    }
  }

  handleICECandidateEvent(e, targetUser) {
    try {
      if (e.candidate) {
        const payload = {
          target: targetUser.connectionId,
          candidate: e.candidate,
        };
        //socketRef.current.emit("ice-candidate", payload);
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
  handleTrackEvent(e, remoteStream) {
    try {
      if (e) {
        console.log("remoteStream working");
        remoteStream.srcObject = e.streams[0];
        remoteStream.onloadedmetadata = function (e) {
          remoteStream.play();
        };
      }
    } catch (error) {
      console.error(error);
    }
  }
  handleNegotiationNeededEvent(targetUser: any) {
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
          // const payload = {
          //   target: that.currentUser,
          //   caller: targetUser.connectionId,
          //   sdp: that.peer.localDescription,
          // };
          //socketRef.current.emit("offer", payload);
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
  handleRecieveCall(targetOffer: any) {
    try {
      var that = this;
      this.peer = this.createPeer(this.targetUser);
      //this.peer = this.createPeer();
      const desc = new RTCSessionDescription(targetOffer.sdp);
      this.peer
        .setRemoteDescription(desc)
        .then(() => {
          that.localStream
            .getTracks()
            .forEach((track) => that.peer.addTrack(track, that.localStream));
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
          //socketRef.current.emit("answer", payload);
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

  iCECandidateReseved: any = [];
  iCECandidate(candidate: any) {
    try {
      var that = this;
      this.iCECandidateReseved.push(candidate.candidate);
      //var cand = candidate.candidate;
      debugger;
      if (
        this.peer &&
        this.peer.remoteDescription &&
        this.peer.remoteDescription.sdp != null &&
        this.peer.remoteDescription.type == "answer"
      )
        if (this.iCECandidateReseved && this.iCECandidateReseved.length > 0) {
          this.iCECandidateReseved.forEach((element) => {
            let myCandidate = new RTCIceCandidate(element);
            that.peer
              .addIceCandidate(myCandidate)
              .catch((e) => console.error(e));
          });
        }
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
      this.iCECandidateReseved = [];
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
      this.peer.close();
      this.hangUpInternal();
    }
  }

  async call() {
    let that = this;
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
        .getUserMedia({ audio: true, video: true })
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
        audio: true,
        video: true,
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
