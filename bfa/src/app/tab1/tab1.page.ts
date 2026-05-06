import { Component } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { BasketService } from '../services/basket.service';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  searchString: any = '';
  products: any[];
  filteredProducts: any[];

  ios: boolean;
  android: boolean;
  isBfaAdmin: boolean;


  constructor(public productService: ProductService,
    public basketService: BasketService,
    public alertController: AlertController,
    public platform: Platform) {
    this.ios = platform.is('ios');
    this.android = platform.is('android');
    this.products = productService.allProducts;
    this.searchString = '';
    this.filterProducts();
    Promise.all([
      UserService.isUserInRole(Parse.User.current(), 'admin'),
      UserService.isUserInRole(Parse.User.current(), 'user'),
      UserService.isUserInRole(Parse.User.current(), 'bfa-admin')
    ]).then(([isAdmin, isUser, isBfaAdmin]) => this.isBfaAdmin = isAdmin || isUser || isBfaAdmin);
  }

  filterProducts() {
    if (!this.searchString || this.searchString === '') {
      this.filteredProducts = this.products;
    } else {
      const searchStringg = this.searchString.toLowerCase();
      this.filteredProducts = this.products.filter(x => {
        const itemSearchstring = x.attributes.name.toLowerCase();
        return itemSearchstring.indexOf(searchStringg) > -1;
      });
    }
  }

  async deleteItem(item: any) {
    if (!item || !confirm(`Den Artikel ${item.get('name')} wirklich löschen?`)) {
      return;
    }

    await item.destroy();
    await this.productService.loadAllProducts();
    this.products = this.productService.allProducts;
    this.searchString = '';
    this.filterProducts();
  }

  async addProduct() {
    try {
      const produktnameAlert = await this.alertController.create({
        header: 'Produkt hinzufügen',
        inputs: [{
          label: 'Produktname',
          name: 'name',
          type: 'text',
          placeholder: 'Gib einen Produktnamen ein'
        }, {
          label: 'Produktpreis',
          name: 'price',
          type: 'number',
          placeholder: 'Gib einen Produktpreis ein'
        }, {
          label: 'Barcode',
          name: 'barcode',
          type: 'text',
          placeholder: 'Gib den Barcode ein (optional)'
        }],
        buttons: [{
          text: 'Abbrechen',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Speichern',
        }],
      });
      await produktnameAlert.present();
      const produktname = await produktnameAlert.onDidDismiss();

      const name = produktname.data?.values?.name;
      const price = produktname.data?.values?.price;
      const barcode = produktname.data?.values?.barcode;

      if (!produktname.data?.values || produktname.role === 'cancel' || !name || !price) {
        return;
      }

      const parseProduct = new Parse.Object('BFA_Products');
      parseProduct.set('name', name);
      parseProduct.set('price', +price);
      if (barcode) parseProduct.set('barcode', barcode);
      await parseProduct.save();

      await this.productService.loadAllProducts();
      this.filterProducts();
    } catch (ex) {
      console.error(ex);
      this.alertController.create({
        header: 'Fehler',
        message: 'Ein unerwarteter Fehler ist aufgetreten.',
        buttons: ['OK']
      }).then(x => x.present());
    }
  }

  openAttendanceList() {
    window.open(environment.attendanceListUrl, '_self');
  }
}
