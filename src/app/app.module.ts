import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";

import { FormsModule } from "@angular/forms";
import { VideoComponent } from "./chat/video/video.component";
import { ConnectService } from "./Services/connect.service";
import { MainComponent } from './chat/main/main.component';

@NgModule({
  declarations: [AppComponent, VideoComponent, MainComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [ConnectService],
  bootstrap: [AppComponent],
})
export class AppModule {}
