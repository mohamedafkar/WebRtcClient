import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { VideoComponent } from "./chat/video/video.component";

const routes: Routes = [{ path: "video", component: VideoComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
