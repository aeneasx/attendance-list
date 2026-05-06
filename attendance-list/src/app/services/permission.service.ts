import { Injectable } from '@angular/core';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';
import { UserRoles } from '../entities/user-roles';

export type AccessLevel = 'admin' | 'user' | 'client' | 'none';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly bfaAuthFallbackUrl = 'https://bfa.spitbat75.ch/login?token=';
  private readonly fischmarktAuthFallbackUrl = 'https://fischmarkt.spitbat75.ch/login?token=';

  readonly appAccessRoles = [UserRoles.admin, UserRoles.user, UserRoles.client];
  readonly editorRoles = [UserRoles.admin, UserRoles.user];

  async currentUser() {
    return Parse.User.current();
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
    const url = this.getBfaAuthUrl();
    if (!url) {
      return;
    }
    window.location.assign(url);
  }

  async openFischmarkt() {
    const url = this.getFischmarktAuthUrl();
    if (!url) {
      return;
    }
    window.location.assign(url);
  }

  getBfaAuthUrl() {
    return this.buildExternalAuthUrl(environment.bfaAuthUrl, this.bfaAuthFallbackUrl);
  }

  getFischmarktAuthUrl() {
    return this.buildExternalAuthUrl(environment.fischmarktAuthUrl, this.fischmarktAuthFallbackUrl);
  }

  buildAttendanceUrl(path: string) {
    return `${environment.attendanceListBasePath.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  private buildExternalAuthUrl(configuredUrl: string, fallbackUrl: string) {
    const sessionToken = Parse.User.current()?.getSessionToken();
    if (!sessionToken) {
      console.error('Keine aktive Session gefunden. Externe App kann nicht geöffnet werden.');
      return null;
    }

    const authUrl = this.resolveExternalAuthUrl(configuredUrl, fallbackUrl);
    return `${authUrl}${encodeURIComponent(sessionToken)}`;
  }

  private resolveExternalAuthUrl(configuredUrl: string, fallbackUrl: string) {
    const url = configuredUrl && configuredUrl !== 'undefined' ? configuredUrl : fallbackUrl;

    if (url.startsWith('/')) {
      const isProductionDomain = location.hostname === 'spitbat75.ch' || location.hostname.endsWith('.spitbat75.ch');
      if (isProductionDomain) {
        return fallbackUrl;
      }

      return `${location.protocol}//${location.host}${url}`;
    }

    return url;
  }
}
