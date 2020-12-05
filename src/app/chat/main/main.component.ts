import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.css"],
})
export class MainComponent implements OnInit {
  call: boolean = false;
  constructor() {}

  ngOnInit() {
    console.log("call is : " + this.call.toString());
  }

  OnCall() {
    this.call = !this.call;
    console.log("call is : " + this.call.toString());
  }
}
