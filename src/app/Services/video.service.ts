import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MessageDto, StreamingDto } from "../DTO/MessageDto";
import { Observable, Subject } from "rxjs";
import * as signalR from "@microsoft/signalr";
import { ConnnectResponse } from "../interfaces/UserInfo";

@Injectable({
  providedIn: "root",
})
export class VideoService {
  private url: string = "http://localhost:55648/api/video/";
  constructor(private http: HttpClient) {}

  public onConnect(userName: string): Observable<any> {
    return this.http.post(this.url + "onConnnect", { UserName: userName });
  }

  public sendStreamOne(userStream: any): Observable<any> {
    var formData: any = new FormData();
    formData.append("connectionId", userStream.connectionId);
    formData.append("stream", userStream.stream);

    return this.http.post(this.url + "sendStreamOne", formData);
  }
}
