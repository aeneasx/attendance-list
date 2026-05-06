import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import * as Parse from 'parse';
import { BehaviorSubject } from 'rxjs';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class AntraegeService {
  public userIsAdmin: boolean = undefined;

  fishysSubject = new BehaviorSubject(null);

  public allAntraege: any[];
  public userFishes: any[];
  public userPoints: number = 0;

  constructor(private permissionService: PermissionService,
    private loadingController: LoadingController) { }

  private async initializeService() {
    if (this.userIsAdmin == undefined) {
      this.userIsAdmin = await this.permissionService.canManageFischmarkt();
    }
  }

  public async getRanking() {
    return await Parse.Cloud.run('getFishRanking', {});
  }

  public async getFishis() {
    await this.initializeService();

    const cuUser = await Parse.User.current().fetch();

    const GameScore = Parse.Object.extend("FM_Aquarium");
    const query = new Parse.Query(GameScore);
    query.equalTo('approved', true);
    query.include('fishType');
    query.include('user');
    query.limit(10000);
    const fishes = await query.find();
    this.userFishes = fishes.filter(x => x.attributes.user?.id === cuUser.id); //ugly fix
    this.userPoints =  this.userFishes.reduce((sum, current) => sum + current.get('fishType').attributes.points, 0);
    this.fishysSubject.next(this.userFishes);
    return this.userFishes;
  }

  public async getAntraege() {
    await this.initializeService();

    const GameScore = Parse.Object.extend("FM_Aquarium");
    const query = new Parse.Query(GameScore);
    query.equalTo('approved', false);
    query.limit(10000);
    this.allAntraege = await query.find();
    return this.allAntraege;
  }

  public async apporveAntrag(antrag: any) {
    antrag.set('approved', true);
    await antrag.save();
    await this.getAntraege();
    await this.getFishis();
  }

  public async denyAntrag(antrag: any) {
    await antrag.destroy();
    await this.getAntraege();
    await this.getFishis();
  }

  public async saveAntrag(user: any, fishType: any, reason: string) {

    const loading = await this.loadingController.create({
      message: 'Bitte warten...',
      translucent: true
    });
    await loading.present();

    const currentUser = await Parse.User.current();

    const GameScore = Parse.Object.extend("FM_Aquarium");
    const antrag = new GameScore();
    if (this.userIsAdmin) {
      antrag.set('approved', true);
    } else {
      antrag.set('approved', false);
    }

    const acl = new Parse.ACL();
    acl.setPublicReadAccess(false);
    acl.setPublicWriteAccess(false);
    acl.setReadAccess(user.id, true);
    acl.setReadAccess(currentUser.id, true);
    acl.setRoleWriteAccess('admin', true);
    acl.setRoleReadAccess('admin', true);
    acl.setRoleWriteAccess('user', true);
    acl.setRoleReadAccess('user', true);
    acl.setRoleWriteAccess('fm-admin', true);
    acl.setRoleReadAccess('fm-admin', true);

    antrag.set("user", user);
    antrag.set("fishType", fishType);
    antrag.set("reason", reason);
    antrag.set("creator", currentUser);
    antrag.setACL(acl);

    await antrag.save();
    await this.getAntraege();
    await this.getFishis();
    await loading.dismiss();
  }

}
