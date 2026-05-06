import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TreeNode } from '../entities/userData';
import * as Parse from 'parse';
import { UserStatus } from '../entities/userStatus';
import { StatusService } from './status.service';
import { DepartmentService } from './department.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  userQuery = new Parse.Query('_User');
  departmentQuery = new Parse.Query('department');
  subscription: any;
  status: any;

  // TreeNode
  data: TreeNode[];
  userSubject = new BehaviorSubject<TreeNode[]>(null);

  // User Status
  userStatus: UserStatus[];
  allUserStatus = new BehaviorSubject<UserStatus[]>(null);

  // Department
  department: any;

  constructor(private statusService: StatusService, private departmentService: DepartmentService) {

    this.userQuery.ascending('lastname');
    this.subscription = this.userQuery.subscribe();

    // Initial load of status
    this.statusService.statusSubject.subscribe(state => {
      if (state) {
        this.status = state;
        this.loadUserData();
        this.checkOnUpdate();
      }
    });

    this.departmentService.deptSubject.subscribe(dept => {
      this.department = dept;
    });

  }

  async checkOnUpdate() {
    (await this.subscription).on('update', () => this.loadUserData());
  }

  loadUserData() {
    this.userQuery.find().then(users => {
      this.resultMapper(users, this.status);
      this.mapUserStatus(users);
    }).catch(err => {
      console.error('Failed to load user data', err);
    });
  }

  mapUserStatus(users) {
    this.userStatus = users.map(x => ({
      user: x,
      status: this.getStatusForUser(x)
    }));
    this.refreshUserStatus();
  }

  refreshUserStatus() {
    this.allUserStatus.next(this.userStatus);
  }

  resultMapper(userList, status) {
    this.data = [];
    let deptData: TreeNode;
    this.departmentQuery.find().then(res => {
      res.forEach(dept => {
        deptData = { name: null, children: [] };
        let tempData: TreeNode;
        let stv = null;
        let stvData: TreeNode;
        deptData.name = dept.attributes.department;
        userList.forEach(user => {
          if (user.attributes.department && dept.id === user.attributes.department.id) {
            tempData = { name: null, children: [] };
            stvData = { name: null, children: [] };
            stv = user.attributes.stv ? user.attributes.stv.attributes : null;
            tempData.name = user.attributes.firstname + ' ' + user.attributes.lastname;
            tempData.children.push({ name: 'Phonenumber: ' + user.attributes.telefoneNumber });
            stvData.name = stv ? stv.firstname + ' ' + stv.lastname : '';
            if (stv) {
              stvData.children.push({ name: 'Phonenumber: ' + stv.telefoneNumber });
            }

            if (status == null) { return; }

            status.forEach(r => {
              if (user && user.attributes.status && r.id === user.attributes.status.id) {
                tempData.children.push({ name: 'Status: ' + r.attributes.status_string });
              }
              if (stv && stv.status && r.id === stv.status.id) {
                stvData.children.push({ name: 'Status: ' + r.attributes.status_string });
              }
            });
            tempData.children.push(stvData);
            deptData.children.push(tempData);
          }
        });
        this.data.push(deptData);
      });
      this.refreshData();
    });
  }

  refreshData() {
    this.userSubject.next(this.data);
  }

  async isLoggedInUserInRole(roleName: string) {
    return await UserService.isUserInRole((await Parse.User.current().fetch()), roleName);
  }

  static async isUserInRole(user: any, roleName: string) {

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

  getStatusForUser(user: any) {
    if (this.status && user?.attributes?.status) {
      return this.status.find(x => user.attributes.status.id === x.id);
    }
    return null;
  }

  getStellvertreter(user: any) {
    if (user.attributes.stv) {
      return this.userStatus.map(y => y.user).find(x => user.attributes.stv.id === x.id);
    }
    return null;
  }

  getStellvertreterUserStatus(user: any) {
    if (user.attributes.stv) {
      return this.userStatus.find(x => user.attributes.stv.id === x.user.id);
    }
    return null;
  }

  getDept(user: any) {
    if (user.attributes.department) {
      return this.department.find(x => user.attributes.department.id === x.id);
    }
    return null;
  }
}
