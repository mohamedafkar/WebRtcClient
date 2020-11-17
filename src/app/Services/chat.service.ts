import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageDto, StreamingDto } from '../DTO/MessageDto';
import { Observable, Subject } from 'rxjs';
import  * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

//      private  connection: any = new signalR.HubConnectionBuilder()
//                                          .withUrl("http://localhost:55648/chatHub")
//                                          .withAutomaticReconnect()
//                                          .build();

//    readonly POST_URL = "http://localhost:55648/api/chat/send"
   
//   private receivedMessageObject: MessageDto = new MessageDto();
//   private sharedObj = new Subject<MessageDto>();


//     private receivedStreamingDto: StreamingDto = new StreamingDto();
//   private StreamingDtoObj = new Subject<StreamingDto>();

//   constructor(private http : HttpClient ) {
//        this.connection.onclose(async () => {await this.start();});
//        this.connection.on("ReceiveOne", (user, message) => { this.mapReceivedMessage(user, message); });

//         this.connection.on("SendOne", (user, message , connectionId) => { this.SendOne(user, message,connectionId); });



//         this.connection.on("SendStreamToOne", (connectionID,myStream) => { this.SendStreamToOne(connectionID, myStream); });


//        this.connection.on("broadcastConnectionId", (connectionId : string) => {
//           localStorage.setItem("connectionId",connectionId);
//           alert(connectionId);
//        });    
//        //this.start();
//    }

//   public async start() {
//     try {
//       await this.connection.start();
//       console.log("connected");
//     } catch (err) {
//       console.log(err);
//       setTimeout(() => this.start(), 1000);
//     } 
//   }

//   private mapReceivedMessage(user: string, message: string): void {
//     this.receivedMessageObject.user = user;
//     this.receivedMessageObject.msgText = message;
//     this.receivedMessageObject.connectionId = localStorage.getItem("connectionId");
//     this.sharedObj.next(this.receivedMessageObject);
//  }

//    private SendOne(user: string, message: string, connectionId : string): void {
//     this.receivedMessageObject.user = user;
//     this.receivedMessageObject.msgText = message;
//     this.receivedMessageObject.connectionId = connectionId;
//     this.sharedObj.next(this.receivedMessageObject);
//  }

//     private SendStreamToOne(connectionId : string,myStream : string): void {
//     this.receivedStreamingDto.myStream = myStream;
//     this.receivedStreamingDto.connectionId = connectionId;
//     this.StreamingDtoObj.next(this.receivedStreamingDto);
//  }


//       public sendStreamToOne(obj: any) {
//       debugger;
//     this.http.post("http://localhost:55648/api/chat/sendstreamtoone", obj).subscribe(data => console.log(data));
//   }

//   public broadcastMessage(msgDto: any) {
//     this.http.post("http://localhost:55648/api/chat/send", msgDto).subscribe(data => console.log(data));
//   }



//     public broadcastMessageToOne(msgDto: any) {
//       debugger;
//     this.http.post("http://localhost:55648/api/chat/sendone", msgDto).subscribe(data => console.log(data));
//   }

//   public retrieveMappedObject(): Observable<MessageDto> {
//     return this.sharedObj.asObservable();
//   }


   



}
