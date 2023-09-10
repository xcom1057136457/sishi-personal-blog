import {  WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {ChatService} from "../api/chat/chat.service";
import {Chat} from "../api/chat/entities/chat.entity";

@WebSocketGateway({
  cors: {
    origin: '*', // 允许的前端地址
  },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService:ChatService) {
  }


  @WebSocketServer()
  server: Server;

  currentUsers = 0;

  messages:Chat[]=[]

  // 当 WebSocket Gateway 初始化完成时，我们向所有客户端广播当前的用户人数。
  afterInit() {
    this.server.emit('usersCount', this.currentUsers);
    this.server.emit('message', this.messages)
  }

  // 当有新的 WebSocket 连接时，我们增加当前用户人数并广播更新。
  async handleConnection(socket: Socket) {
    this.incrementUsersCount();
    this.server.emit('usersCount', this.currentUsers)


    const chats=await this.chatService.findAll()
    this.messages=chats
    this.server.emit('message', this.messages)

    // 监听 'chatMessage' 事件
    socket.on('chatMessage', (message) => {
      console.log('Received chatMessage:', message);
      this.messages.push(message)
      console.log(this.messages)
      // 在这里可以对接收到的消息进行处理
    });
  }


  // 当 WebSocket 连接断开时，我们减少当前用户人数并广播更新。
  handleDisconnect(socket: Socket) {
    this.decrementUsersCount();
    this.server.emit('usersCount', this.currentUsers);
  }


  incrementUsersCount() {
    this.currentUsers++;
  }

  decrementUsersCount() {
    this.currentUsers--;
  }
}
