import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as Parse from 'parse';
import { UserService } from '../services/user.service';
import { UserRoles } from '../entities/user-roles';
import { environment } from 'src/environments/environment';
import { PermissionService } from '../services/permission.service';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  @Output()
  closeNav = new EventEmitter();
  isAdmin: boolean;
  canUseApps = false;
  isGeoLocationUser = false;

  constructor(private userService: UserService,
    private permissionService: PermissionService) { }

  async ngOnInit(): Promise<void> {
    try {
      const [isAdmin, canUseApps, isGeoLocationUser] = await Promise.all([
        this.permissionService.canAdmin(),
        this.permissionService.canUseApps(),
        this.userService.isLoggedInUserInRole(UserRoles.geoTracking),
      ]);

      this.isAdmin = isAdmin;
      this.canUseApps = canUseApps;
      this.isGeoLocationUser = isGeoLocationUser;
    } catch (error) {
      console.error(error);
    }
  }


  async logout() {
    Parse.User.logOut().then(() => {
      window.location.assign(this.buildUrl(environment.attendanceListBasePath, 'login'));
    });
  }

  async openBfa() {
    await this.permissionService.openBfa();
  }


  async openFischmarkt() {
    await this.permissionService.openFischmarkt();
  }

  openSingBook() {
    window.open(this.buildUrl(environment.attendanceListBasePath, 'assets/2022_Liederbuch_4_Auflage_print.pdf'))
  }

  onClick() {
    this.closeNav.emit(null);
  }

  private buildUrl(basePath: string, path: string) {
    return `${basePath.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
