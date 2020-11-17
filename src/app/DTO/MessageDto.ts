export class MessageDto {
  public user: string = '';
  public msgText: string = '';
  public connectionId: string = '';
  
}

export class StreamingDto {
  public connectionId: string = '';
  public myStream : string = '';
}