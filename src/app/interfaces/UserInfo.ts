export interface UserInfo{
     UserName : string
     ConnectionId : string
}


export interface Massages{
    UserName : string,
    ConnectionId : string
    Massage : string
}

export interface ConnnectResponse{
    UserName : string
    IsConnected : boolean
}
