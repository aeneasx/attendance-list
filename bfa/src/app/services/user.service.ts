import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  static async isUserInRole(user: any, roleName: string) {
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

    const comments = await query.find();

    return comments ? comments.length > 0 : false;
  }

  async isUserInAnyRole(user: any, roleNames: string[]) {
    for (const roleName of roleNames) {
      if (await UserService.isUserInRole(user, roleName)) {
        return true;
      }
    }
    return false;
  }

  async getAllUsers() {
    const user = Parse.Object.extend('_User');
    const query = new Parse.Query(user);
    query.ascending('lastname');
    query.limit(100000);
    return await query.find();
  }

  async getUsersWithOrders() {
    const GameScore = Parse.Object.extend('BFA_Orders');
    const query = new Parse.Query(GameScore);
    query.descending('orderedAt');
    query.include('user');
    query.limit(10000);
    const result = await query.find();

    const map = new Map();

    result.filter(x => !!x.get('user')).forEach(x => map.set(x.get('user').id, x.get('user')));
    return Array.from(map.values());
  }

  async isLoggedInUserInRole(roleName: string) {
    return await UserService.isUserInRole((await Parse.User.current().fetch()), roleName);
  }

  async isLoggedInUserInAnyRole(roleNames: string[]) {
    const currentUser = await Parse.User.current()?.fetch();
    return await this.isUserInAnyRole(currentUser, roleNames);
  }


}
