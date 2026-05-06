import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import * as Parse from 'parse';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserService } from '../services/user.service';

@Injectable()
export class CanActivateAuthenticated {

  constructor(private userService: UserService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return new Promise(async resolve => {
      try {
        const currentUser = await Parse.User.current()?.fetch();
        if (!currentUser) {
          window.location.assign(environment.attendanceListUrl);
          resolve(false);
          return;
        }

        const isAllowed = await this.userService.isUserInAnyRole(currentUser, ['admin', 'user', 'client', 'bfa-user']);
        if (!isAllowed) {
          window.location.assign(environment.attendanceListUrl);
          resolve(false);
          return;
        }

        resolve(true);
      } catch (ex) {
        console.error(ex);
        await Parse.User.logOut();
        window.location.assign(environment.attendanceListUrl);
        resolve(false);
      }
    });
  }
}
