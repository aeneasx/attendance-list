import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as Parse from 'parse';
import { UserService } from '../services/user.service';
import { UserRoles } from '../entities/user-roles';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  @Output()
  closeNav = new EventEmitter();
  isAdmin: boolean;
  isBFAUser = false;
  isFmUser = false;
  isGeoLocationUser = false;

  constructor(private userService: UserService) { }

  async ngOnInit(): Promise<void> {
    try {
      const [isAdmin, isUser, isClient, isBFAUser, isGeoLocationUser, isFmUser] = await Promise.all([
        this.userService.isLoggedInUserInRole(UserRoles.admin),
        this.userService.isLoggedInUserInRole(UserRoles.user),
        this.userService.isLoggedInUserInRole(UserRoles.client),
        this.userService.isLoggedInUserInRole(UserRoles.bfaUser),
        this.userService.isLoggedInUserInRole(UserRoles.geoTracking),
        this.userService.isLoggedInUserInRole(UserRoles.fmUser),
      ]);

      const hasBaseAppAccess = isAdmin || isUser || isClient;
      this.isAdmin = isAdmin;
      this.isBFAUser = isBFAUser || hasBaseAppAccess;
      this.isGeoLocationUser = isGeoLocationUser;
      this.isFmUser = isFmUser || hasBaseAppAccess;
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
    const currentUser = await Parse.User.current().fetch();
    window.location.assign(environment.bfaAuthUrl + currentUser.getSessionToken());
  }


  async openFischmarkt() {
    const currentUser = await Parse.User.current().fetch();
    window.location.assign(environment.fischmarktAuthUrl + currentUser.getSessionToken());
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
