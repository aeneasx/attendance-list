import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import * as Parse from 'parse';
import { Injectable } from "@angular/core";
import { PermissionService } from "../services/permission.service";

@Injectable()
export class CanActivateAuthenticated  {

  constructor(private permissionService: PermissionService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return new Promise(async (resolve) => {
      try {
        const currentUser = await Parse.User.current()?.fetch();
        if (!currentUser) {
          await this.permissionService.redirectToAttendance();
          resolve(false);
          return;
        }

        const isAllowed = await this.permissionService.canUseFischmarkt(currentUser);
        if (!isAllowed) {
          await this.permissionService.redirectToAttendance();
          resolve(false);
          return;
        }

        resolve(true);
      } catch (ex) {
        console.error(ex);
        await Parse.User.logOut();
        await this.permissionService.redirectToAttendance();
        resolve(false);
      }
    });
  }
}
