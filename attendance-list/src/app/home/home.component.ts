import { Component, OnInit } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  canUseApps = false;

  constructor(private permissionService: PermissionService) { }

  async ngOnInit(): Promise<void> {
    this.canUseApps = await this.permissionService.canUseApps();
  }

  openBfa() {
    this.permissionService.openBfa();
  }

  openFischmarkt() {
    this.permissionService.openFischmarkt();
  }

}
