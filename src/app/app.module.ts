import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoomComponent } from './room/room.component';
import { HomeComponent } from './home/home.component';
import { CanvasComponent } from './canvas/canvas.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';

// const config: SocketIoConfig = { url: 'http://localhost:9999', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    RoomComponent,
    HomeComponent,
    CanvasComponent,
    SidebarComponent,
    ChatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'room/:roomID',
        component: RoomComponent,
      },
    ]),
    // SocketIoModule.forRoot(config),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
