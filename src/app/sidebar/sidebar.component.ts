import { Component, OnInit, Input } from '@angular/core';
import { UserContainer } from 'src/app/model/user-container';
import { User } from '../interfaces';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() users: UserContainer;
  @Input() hostUser: string;
  @Input() mySelf: User;
  constructor() {}

  ngOnInit(): void {}
}
