import { Injectable } from '@angular/core';
import * as Parse from 'parse';
import { ProductService } from './product.service';
import { BehaviorSubject } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';
import { OrderService } from './order.service';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  
  basketSubject = new BehaviorSubject(null);
  basket: any[];

  constructor(private loadingController: LoadingController,
    private orderService: OrderService,
    public toastController: ToastController) { 
    this.basket = [];
    this.orderService.loadUserOrders();
  }

  additem2Basket(item: any) {
    this.basket.push(item);
    this.updateSubject();
    this.showToast(`"${item.attributes.name}" zum Warenkorb hinzugefügt.`);
  }

  removeItemFrombasket(item: any) {
    const index = this.basket.findIndex(x => x.id === item.id);
    if (index !== -1) {
      this.basket.splice(index, 1);
      this.updateSubject();
      this.showToast(`"${item.attributes.name}" von Warenkorb entfernt.`);
    }
  }

  public async placeOrder() {    
    if (this.basket?.length > 0) {
      
      const loading = await this.loadingController.create({
        message: 'Bitte warten...',
        translucent: true
      });
      await loading.present();

      const currentUser = await Parse.User.current();
      const orderAmount = this.basket.reduce((sum, current) => sum + current.attributes.price, 0);

      const acl =  new Parse.ACL();

      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
      acl.setReadAccess(currentUser.id, true);
      acl.setRoleWriteAccess('admin', true);
      acl.setRoleReadAccess('admin', true);
      acl.setRoleWriteAccess('user', true);
      acl.setRoleReadAccess('user', true);
      acl.setRoleWriteAccess('bfa-admin', true);
      acl.setRoleReadAccess('bfa-admin', true);

      const GameScore = Parse.Object.extend("BFA_Orders");
      const gameScore = new GameScore();
      gameScore.set("orderedAt", new Date());
      gameScore.set("user", currentUser);
      gameScore.set("amount", orderAmount);
      gameScore.setACL(acl);
      const savedOrder = await gameScore.save();

      for (let product of this.basket) {
        const ProdOrder = Parse.Object.extend("BFA_OrderProducts");
        const productOrder = new ProdOrder();
        productOrder.set("order", savedOrder);
        productOrder.set("product", product);
        productOrder.set("user", currentUser);
        productOrder.setACL(acl);
        const savedOrderproduct = await productOrder.save();
      }

      this.basket = [];
      this.updateSubject();
      await this.orderService.loadUserOrders();
      await loading.dismiss();
    }
  }

  private updateSubject() {
    this.basketSubject.next(this.basket);
  }

  private async showToast(text: string) {
    const toast = await this.toastController.create({
      message: text,
      position: 'top',
      duration: 1300
    });
    toast.present();
  }
}
