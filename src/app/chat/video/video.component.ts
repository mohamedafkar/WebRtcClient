import { Component, OnInit } from "@angular/core";
import { ConnectService } from "src/app/Services/connect.service";
import { VideoService } from "src/app/Services/video.service";

//import adapter from "webrtc-adapter";

@Component({
  selector: "app-video",
  templateUrl: "./video.component.html",
  styleUrls: ["./video.component.css"],
})
export class VideoComponent implements OnInit {
  userName: string = "jack";
  userInfo: any = {};
  users: any = [];
  callingUser: any;

  mediaRecorder: any;
  mediaDevices = navigator.mediaDevices as any;
  // @ViewChild("localVideo", { static: false }) localVideo: HTMLVideoElement;
  // @ViewChild("remoteVideo", { static: false }) remoteVideo: HTMLVideoElement;
  localVideo: any; //= document.getElementById("localVideo") as HTMLVideoElement;
  remoteVideo: any; // = document.getElementById("remoteVideo") as HTMLVideoElement;
  localStream: any;
  isAudio = true;
  isVideo = true;
  mediaElement = document.getElementById("MediaElement") as HTMLMediaElement;
  constructor(
    private connectService: ConnectService,
    private videoService: VideoService
  ) {}

  ngOnInit() {
    this.connectService.connection.on(
      "SendConnectionId",
      (connectionId: any) => {
        debugger;
        sessionStorage.setItem("connectionId", connectionId);
      }
    );

    this.connectService.connection.on("updateUserList", (userList: any) => {
      debugger;
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
      debugger;
      this.callingUser = user;
    });

    this.connectService.connection.on("CallEnded", (massage: any) => {
      debugger;
      alert(massage);
    });

    this.connectService.connection.on(
      "CallDeclined",
      (decliningUser: any, massage: any) => {
        debugger;
        alert(massage);
      }
    );

    this.connectService.connection.on("CallAccepted", (callingUser: any) => {
      debugger;
      alert(callingUser.username + " " + "Accept your call");
    });

    this.connectService.connection.on(
      "CallEnded",
      (callingUser: any, massage: any) => {
        debugger;
        alert(massage);
      }
    );

    this.connectService.start();
  }

  DisConnect() {
    debugger;
    this.connectService.connection.invoke("Disconnected").catch((err) => {
      console.error(err);
    });
  }

  connect() {
    //this.onConnnect(this.userName);
    debugger;
    this.connectService.connection
      .invoke("Join", this.userName)
      .catch((err) => {
        console.error(err);
      });

  }

  CallUser(userIndex: number) {
    let user = this.users[userIndex];
    this.connectService.connection.invoke("CallUser", user).catch((err) => {
      console.error(err);
    });
  }

  answerCall(targetUser: any) {
    debugger;
    this.connectService.connection
      .invoke("AnswerCall", true, targetUser)
      .catch((err) => {
        console.error(err);
      });
  }

  cancelCall(callingUser: any) {
    debugger;
    var reson = "Busy";
    this.connectService.connection
      .invoke("CallDeclined", callingUser, reson)
      .catch((err) => {
        console.error(err);
      });
  }

  hangUp() {
    debugger;
    this.connectService.connection.invoke("HangUp").catch((err) => {
      console.error(err);
    });
    this.hangUpInternal();
  }

  // onConnnect(userName: any) {
  //   var that = this;
  //   debugger;
  //   this.myConnection = this.connectService.connection.connectionId;
  //   //debugger;
  //   // that.connectService.connection
  //   //   .invoke("OnConnnectInvoke", { userName: userName })
  //   //   .catch(function (err) {
  //   //     debugger;
  //   //     return console.error(err.toString());
  //   //   });
  //   //
  //   //this.userInfo = ConnnectResponse;

  //   this.videoService.onConnect(userName).subscribe(
  //     (s) => {
  //       // if (s && s.isConnected) {
  //       //   that.userInfo.userName = s.userName;
  //       //   debugger;
  //       //   this.userInfo.allUsers = s.allUsers;
  //       //   console.log(
  //       //     s.userName +
  //       //       " is connected " +
  //       //       s.isConnected +
  //       //       " id " +
  //       //       that.userInfo.ConnectionId
  //       //   );
  //       // }
  //     },
  //     (e) => {
  //       console.log(e);
  //     }
  //   );
  // }

  sendStreamOne(userStream: any) {
    var that = this;
    this.videoService.sendStreamOne(userStream).subscribe(
      (stream) => {
        debugger;
        console.log(stream);
      },
      (e) => {
        console.log(e);
      }
    );
  }

  async call() {
    let that = this;
    //defind
    that.localVideo = document.getElementById("localVideo") as HTMLMediaElement;
    that.remoteVideo = document.getElementById(
      "remoteVideo"
    ) as HTMLMediaElement;
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
    //   debugger;
    //   var x = this.localStream.captureStream();
    // }

    // if (this.localStream) {
    //   this.mediaRecorder = new MediaRecorder(this.localStream);
    //   //let chunks = [];
    //   this.mediaRecorder.start(500);
    //   this.mediaRecorder.ondataavailable = function (ev) {
    //     //debugger;
    //     //that.sendStreamOne({ stream: ev.data });
    //     // var reader = new FileReader();
    //     // reader.readAsDataURL(ev.data);
    //     // reader.onload = reader.onload = readSuccess;
    //     // function readSuccess(evt) {
    //     //   debugger;
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

    //     debugger;
    //     //this.sleep(100);
    //     //var x = chunks.push(ev.data);
    //   };
  }

  async sleep(msec) {
    return new Promise((resolve) => setTimeout(resolve, msec));
  }
}
