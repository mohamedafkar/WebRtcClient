import { Component, OnInit } from "@angular/core";
import { HubConnectionState } from "@microsoft/signalr";
import { userInfo } from "os";
import { UserInfo } from "src/app/interfaces/UserInfo";

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
  remoteConnection: string = "";
  myConnection: string = "";
  userInfo: any = {};

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
    this.remoteVideo = document.getElementById(
      "remoteVideo"
    ) as HTMLVideoElement;
    if (
      this.connectService.connection.state == HubConnectionState.Disconnected
    ) {
      this.connectService.connection.on(
        "broadcastConnectionId",
        (data: any) => {
          this.myConnection = data;
          this.userInfo.connectionId = data;
        }
      );
      this.connectService.connection.on("onConnnect", function (userName) {
        debugger;
        var x = userName;
      });
      this.connectService.connection.on("sendStreamToOne", (stream: any) => {
        debugger;
        this.remoteVideo.srcObject = stream;
      });
      this.connectService.start();
    }
  }
  connect() {
    this.onConnnect(this.userName);
  }

  onConnnect(userName: any) {
    var that = this;
    debugger;
    this.myConnection = this.connectService.connection.connectionId;
    //debugger;
    // that.connectService.connection
    //   .invoke("OnConnnectInvoke", { userName: userName })
    //   .catch(function (err) {
    //     debugger;
    //     return console.error(err.toString());
    //   });
    //
    //this.userInfo = ConnnectResponse;

    this.videoService.onConnect(userName).subscribe(
      (s) => {
        // if (s && s.isConnected) {
        //   that.userInfo.userName = s.userName;
        //   debugger;
        //   this.userInfo.allUsers = s.allUsers;
        //   console.log(
        //     s.userName +
        //       " is connected " +
        //       s.isConnected +
        //       " id " +
        //       that.userInfo.ConnectionId
        //   );
        // }
      },
      (e) => {
        console.log(e);
      }
    );
  }

  sendStreamOne(userStream: any) {
    var that = this;
    userStream.connectionId = that.remoteConnection;
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
    this.hangUp();
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

  async hangUp() {
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
