import { Component } from '@angular/core';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showLoader: boolean;
  currentUser: any;
  constructor(private productService: ProductService) {
    try {
      this.showLoader = true;

      Parse.initialize(environment.parseAppId);
      (Parse as any).serverURL = this.resolveParseServerUrl(environment.parseServerUrl);
    } catch (ex) {
      alert('Ein unerwarteter fehler ist aufgetreten.');
      console.error(ex);
      this.logout();
    }

    this.ngOnInit();
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
    try {

      this.currentUser = await Parse.User.current();
      if (!this.currentUser) {
        this.showLoader = false;
        return;
      } else {
        this.currentUser = await Parse.User.current().fetch();
      }

      await this.productService.loadAllProducts();
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
      //location.reload();
    });
  }
}
