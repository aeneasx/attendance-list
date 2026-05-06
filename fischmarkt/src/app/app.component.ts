import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';
import { AntraegeService } from './services/antraege.service';
import { FishTypeService } from './services/fish-type.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showLoader: boolean;
  currentUser: any;
  constructor(private router: Router,
    private antraegeService: AntraegeService,
    private userService: UserService,
    private fishTypeService: FishTypeService,
    public alertController: AlertController) {
    try {
      this.showLoader = true;

      Parse.initialize(environment.parseAppId);
      (Parse as any).serverURL = this.resolveParseServerUrl(environment.parseServerUrl);

      this.init();

    } catch (ex) {
      alert('Ein unerwarteter fehler ist aufgetreten.');
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

  async init() {
    try {

      this.currentUser = await Parse.User.current();
      if (!this.currentUser) {
        // this.presentAlert('Der Benutzer ist nicht angemeldet.');
      } else {
        this.currentUser = await Parse.User.current().fetch();
        const alltasks = [] as Promise<any>[];
        alltasks.push(this.antraegeService.getAntraege());
        alltasks.push(this.antraegeService.getFishis());
        alltasks.push(this.userService.loadAllUsers());
        alltasks.push(this.fishTypeService.loadAllFishTypes());

        for (const item of alltasks) {
          await item;
        }
      }

      this.showLoader = false;

    } catch (ex) {
      alert('Ein unerwarteter fehler ist aufgetreten.');
      console.error(ex);
      this.logout();
    }
  }

  private async logout() {
    this.currentUser = null;
    Parse.User.logOut().then(() => {
      location.reload();
    });
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Hinweis',
      subHeader: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
