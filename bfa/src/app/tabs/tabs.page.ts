import { Component } from '@angular/core';
import { BasketService } from '../services/basket.service';
import { PermissionService } from '../services/permission.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  isAdmin = false;
  badgeCount: number = 0;

  constructor(public basketService: BasketService,
    private permissionService: PermissionService) {
    this.basketService.basketSubject.subscribe(x => {
      if (x != null) {
        this.badgeCount = x.length;
      }
    });

    this.permissionService.canManageBfa().then(x => this.isAdmin = x);
  }

}
