import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ChatService } from "./Services/chat.service";
import { ChatComponent } from "./chat/chat/chat.component";
import { HttpClientModule } from "@angular/common/http";

import { FormsModule } from "@angular/forms";
import { VideoComponent } from "./chat/video/video.component";
import { ConnectService } from "./Services/connect.service";
import { VideoService } from "./Services/video.service";

@NgModule({
  declarations: [AppComponent, ChatComponent, VideoComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [ChatService, ConnectService, VideoService],
  bootstrap: [AppComponent],
})
export class AppModule {}
