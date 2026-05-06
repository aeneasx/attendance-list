import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  allUsers: any;
  
  public async loadAllUsers(): Promise<void> {
    const GameScore = Parse.Object.extend("_User");
    const query = new Parse.Query(GameScore);
    query.ascending('grad');
    query.limit(10000);
    this.allUsers = await query.find();
  }

  async isLoggedInUserInRole(roleName: string) {
    return await this.isUserInRole((await Parse.User.current().fetch()), roleName);
  }

  async isLoggedInUserInAnyRole(roleNames: string[]) {
    const currentUser = await Parse.User.current()?.fetch();
    return await this.isUserInAnyRole(currentUser, roleNames);
  }

  async isUserInAnyRole(user: any, roleNames: string[]) {
    for (const roleName of roleNames) {
      if (await this.isUserInRole(user, roleName)) {
        return true;
      }
    }
    return false;
  }

  async isUserInRole(user: any, roleName: string) {
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

}
