import { Injectable, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MessageDto, StreamingDto } from "../DTO/MessageDto";
import { Observable, Subject } from "rxjs";
import * as signalR from "@microsoft/signalr";

@Injectable({
  providedIn: "root",
})
export class ConnectService implements OnInit {
  public connection: any = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:55648/videoHub")
    .withAutomaticReconnect()
    .build();
  constructor() {}

  ngOnInit(): void {
    this.connection.onclose(async () => {
      debugger;
      console.log("video Resconnecting...");
      await this.start();
    });
  }

  public async start() {
    try {
      //debugger;
      await this.connection.start();
      console.log("video connected");
    } catch (err) {
      debugger;
      console.log(err);
      console.log("video Disconnected");
    }
  }
}
