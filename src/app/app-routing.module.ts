import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MainComponent } from "./chat/main/main.component";
import { VideoComponent } from "./chat/video/video.component";

const routes: Routes = [
  { path: "video", component: VideoComponent },
  { path: "main", component: MainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
