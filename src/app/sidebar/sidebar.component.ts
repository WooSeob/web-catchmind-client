import { Component, OnInit, Input } from '@angular/core';
import { UserContainer } from '../draw';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() users: UserContainer;
  @Input() hostUser: string;
  constructor() {}

  ngOnInit(): void {}
}
