import { Component, OnInit } from '@angular/core';
import { MessageDto } from 'src/app/DTO/MessageDto';
import { ChatService } from 'src/app/Services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

    msgDto: MessageDto = new MessageDto();
    msgInboxArray: MessageDto[] = [];
  conId: string;
  constructor(private chatService : ChatService ) { }

  ngOnInit() {
    // this.chatService.retrieveMappedObject().subscribe( 
    //   (receivedObj: MessageDto) => { this.addToInbox(receivedObj);
    // });

    // this.conId = localStorage.getItem("connectionId");
  }

    addToInbox(obj: MessageDto) {
    let newObj = new MessageDto();
    newObj.user = obj.user;
    newObj.msgText = obj.msgText;
    this.msgInboxArray.push(newObj);
  }

  send(): void {
    //this.chatService.broadcastMessage(this.msgDto);     
  }

    send2(): void {
    this.msgDto.connectionId = localStorage.getItem("connectionId");
    debugger;
    //this.chatService.broadcastMessageToOne(this.msgDto);     
  }

}
