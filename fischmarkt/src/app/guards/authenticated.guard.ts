import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import * as Parse from 'parse';
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { UserService } from "../services/user.service";
import { FMConstants } from "../constants";

@Injectable()
export class CanActivateAuthenticated  {

  constructor(private router: Router, private userService: UserService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return new Promise(async (resolve) => {
      try {
        const currentUser = await Parse.User.current()?.fetch();
        if (!currentUser) {
          window.location.assign(environment.attendanceListUrl ?? '/auth');
          resolve(false);
          return;
        }

        const isAllowed = await this.userService.isUserInAnyRole(currentUser, ['admin', 'user', 'client', FMConstants.UserRole]);
        if (!isAllowed) {
          window.location.assign(environment.attendanceListUrl ?? '/auth');
          resolve(false);
          return;
        }

        resolve(true);
      } catch (ex) {
        console.error(ex);
        resolve(this.router.parseUrl('/'));
        Parse.User.logOut();
      }
    });
  }
}
