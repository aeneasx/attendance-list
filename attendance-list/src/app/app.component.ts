import { Component, OnInit, ViewChild } from '@angular/core';
import * as Parse from 'parse';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { ParameterService } from './services/parameter.service';
import { Parameter } from './constants/parameter';
import { UserRoles } from './entities/user-roles';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeolocationService } from './services/geo-location.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('sidenav') sidenav: MatSidenav;
  currentUser: any;
  title: any;
  showLoader: boolean;

  constructor(private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly snackbar: MatSnackBar,
    private readonly geoService: GeolocationService) {
    try {
      Parse.initialize(environment.parseAppId);

      (Parse as any).serverURL = this.resolveParseServerUrl(environment.parseServerUrl);
      this.geoService.initializeIfAllowed();
    } catch (ex) {
      console.error(ex);
      this.logout();
    }
  }

  private resolveParseServerUrl(parseServerUrl: string): string {
    if (!parseServerUrl.startsWith('/')) {
      return parseServerUrl;
    }

    if (location.hostname.endsWith('spitbat75.ch') && location.hostname !== 'api.spitbat75.ch') {
      return `https://api.spitbat75.ch${parseServerUrl}`;
    }

    return `${location.protocol}//${location.host}${parseServerUrl}`;
  }

  async ngOnInit() {
    this.showLoader = true;
    try {

      this.currentUser = await Parse.User.current()?.fetch();
      if (!this.currentUser && !location.pathname.includes('skill-share')) {
        this.showLoader = false;
        this.router.navigateByUrl('/login');
      } else {
        this.showLoader = false;
      }
    } catch (ex) {
      console.error(ex);
      this.logout();
    }
  }

  private async logout() {
    this.currentUser = null;
    Parse.User.logOut().then(() => {
      this.snackbar.open('Du wurdest automatisch ausgeloggt.', null, {
        duration: 2000
      });
      this.router.navigateByUrl('/login');
    });
  }

  public async getUserStatus(user: any) {
    const query = new Parse.Query('status');
    query.equalTo('objectId', user.attributes.status.id);
    return await query.first();
  }

  async isUserInRole(user: any, roleName: string) {

    const User = Parse.Object.extend('_User');
    const Role = Parse.Object.extend('_Role');

    const innerQuery = new Parse.Query(User);
    innerQuery.equalTo('objectId', user.id);

    const query = new Parse.Query(Role);
    query.equalTo('name', roleName);
    query.matchesQuery('users', innerQuery);

    const comments = await query.find();

    return comments ? comments.length > 0 : false;
  }

  close() {
    this.sidenav.close();
  }
}
