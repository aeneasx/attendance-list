import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserStatus } from '../entities/userStatus';
import { DepartmentService } from '../services/department.service';

@Component({
  selector: 'app-user-directory',
  templateUrl: './user-directory.component.html',
  styleUrls: ['./user-directory.component.scss']
})
export class UserDirectoryComponent implements OnInit {

  userStatus: UserStatus[];
  filteredUserStatus: UserStatus[];
  filterValue: string;
  departments: any;

  constructor(private userService: UserService, private departmentService: DepartmentService) { }

  ngOnInit(): void {
    this.departmentService.deptSubject.subscribe(dept => {
      this.departments = dept;
    });

    this.userService.allUserStatus.subscribe(data => {
      if (data) {
        this.userStatus = data;
        this.filterUserStatus();
      }
    });
  }

  filterUserStatus() {
    if (!this.userStatus) {
      this.filteredUserStatus = [];
      return;
    }

    if (this.filterValue == null || this.filterValue.split(' ').join('') === '') {
      // Not filtering necessary
      this.filteredUserStatus = this.userStatus;
    } else {
      // Filter
      this.filteredUserStatus = this.userStatus.filter(x => {
        // tslint:disable-next-line:no-shadowed-variable
        let dept = (this.departments || []).map(dept =>
          x.user.attributes.department && dept.id === x.user.attributes.department.id ? dept.attributes.department : null)
          .filter(el => {
            return el !== null;
          });
        dept = dept[0];

        let username = x.user.attributes.grad + x.user.attributes.firstname + x.user.attributes.lastname
          + x.user.attributes.position + x.user.attributes.username + dept + (x.status ? x.status.attributes.status_string : '');

        username = username.toLowerCase().split(' ').join('');
        // console.log(dept);
        return username.includes(this.filterValue.toLowerCase().split(' ').join(''));
      });
    }
  }

  searchDepartment(item) {
    this.filterValue = item.attributes.department;
    this.filterUserStatus();
  }
}
