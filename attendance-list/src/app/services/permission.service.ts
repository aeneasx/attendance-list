import { Injectable } from '@angular/core';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';
import { UserRoles } from '../entities/user-roles';

export type AccessLevel = 'admin' | 'user' | 'client' | 'none';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  readonly appAccessRoles = [UserRoles.admin, UserRoles.user, UserRoles.client];
  readonly editorRoles = [UserRoles.admin, UserRoles.user];

  async currentUser() {
    return await Parse.User.current()?.fetch();
  }

  async hasRole(roleName: string, user = Parse.User.current()) {
    if (!user || !roleName) {
      return false;
    }

    const User = Parse.Object.extend('_User');
    const Role = Parse.Object.extend('_Role');

    const innerQuery = new Parse.Query(User);
    innerQuery.equalTo('objectId', user.id);

    const query = new Parse.Query(Role);
    query.equalTo('name', roleName);
    query.matchesQuery('users', innerQuery);

    return (await query.count()) > 0;
  }

  async hasAnyRole(roleNames: string[], user = Parse.User.current()) {
    for (const roleName of roleNames) {
      if (await this.hasRole(roleName, user)) {
        return true;
      }
    }
    return false;
  }

  async getAccessLevel(user = Parse.User.current()): Promise<AccessLevel> {
    if (await this.hasRole(UserRoles.admin, user)) {
      return 'admin';
    }
    if (await this.hasRole(UserRoles.user, user)) {
      return 'user';
    }
    if (await this.hasRole(UserRoles.client, user)) {
      return 'client';
    }
    return 'none';
  }

  async canUseApps(user = Parse.User.current()) {
    return await this.hasAnyRole([
      ...this.appAccessRoles,
      UserRoles.bfaUser,
      UserRoles.fmUser
    ], user);
  }

  async canManage(user = Parse.User.current()) {
    return await this.hasAnyRole(this.editorRoles, user);
  }

  async canAdmin(user = Parse.User.current()) {
    return await this.hasRole(UserRoles.admin, user);
  }

  async bootstrapPermissions() {
    return await Parse.Cloud.run('bootstrapPermissions');
  }

  async openBfa() {
    const currentUser = await this.currentUser();
    if (!currentUser) {
      return;
    }
    window.location.assign(environment.bfaAuthUrl + currentUser.getSessionToken());
  }

  async openFischmarkt() {
    const currentUser = await this.currentUser();
    if (!currentUser) {
      return;
    }
    window.location.assign(environment.fischmarktAuthUrl + currentUser.getSessionToken());
  }

  buildAttendanceUrl(path: string) {
    return `${environment.attendanceListBasePath.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
