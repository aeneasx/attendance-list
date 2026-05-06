import { Injectable } from '@angular/core';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';
import { FMConstants } from '../constants';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  readonly appAccessRoles = ['admin', 'user', 'client', FMConstants.UserRole];
  readonly editorRoles = ['admin', 'user', FMConstants.AdminRole];

  constructor(private userService: UserService) { }

  async currentUser() {
    return await Parse.User.current()?.fetch();
  }

  async hasAnyRole(roleNames: string[], user = Parse.User.current()) {
    return await this.userService.isUserInAnyRole(user, roleNames);
  }

  async canUseFischmarkt(user = Parse.User.current()) {
    return await this.hasAnyRole(this.appAccessRoles, user);
  }

  async canManageFischmarkt(user = Parse.User.current()) {
    return await this.hasAnyRole(this.editorRoles, user);
  }

  async redirectToAttendance() {
    window.location.assign(environment.attendanceListUrl);
  }
}
