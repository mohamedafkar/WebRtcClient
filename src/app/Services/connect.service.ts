import { Injectable, OnInit } from "@angular/core";
import * as signalR from "@microsoft/signalr";
import { Observable, pipe } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ConnectService implements OnInit {
  public connection: any = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:44389/ConnectionHub")
    //.withAutomaticReconnect()
    .build();
  constructor() {}

  ngOnInit(): void {
    this.connection.onclose(async () => {
      debugger;
      console.log("video Resconnecting...");
      await this.start();
    });

    // this.connection.hub.stateChanged = function (state) {
    //   debugger;
    //   var stateConversion = {
    //     0: "connecting",
    //     1: "connected",
    //     2: "reconnecting",
    //     4: "disconnected",
    //   };
    //   console.log(
    //     "SignalR state changed from: " +
    //       stateConversion[state.oldState] +
    //       " to: " +
    //       stateConversion[state.newState]
    //   );
    // };
  }

  public async start() {
    try {
      await this.connection.start();
      console.log("video connected");
      return true;
    } catch (err) {
      console.log(err);
      console.log("video Disconnected");
      setTimeout(() => this.start(), 2000);
      return false;
    }
  }

  // public async stop() {
  //   try {
  //     await ;
  //     console.log("video stop");
  //     return true;
  //   } catch (err) {
  //     console.log(err);
  //     console.log("video Disconnected");
  //     return false;
  //   }
  // }

  stop = async (): Promise<boolean> => {
    let result;
    try {
      result = await this.connection.stop();
    } catch (err) {
      console.log("ERROR -- ", err);
      result = err;
    }
    console.log("----->>>", result);
    return result;
  };
}
