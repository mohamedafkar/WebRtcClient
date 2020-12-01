// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // iceServers: [{ urls: "stun:stun.l.google.com:19305" }],
  iceServers: [{ urls: "stun:192.168.43.81:3478" }],
  //hubUrl: "https://192.168.100.72/server/",
  hubUrl: "https:/192.168.43.81/server/",
};
