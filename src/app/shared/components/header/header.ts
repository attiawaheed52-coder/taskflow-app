import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

@Component({
  selector: 'app-header',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './header.html',

  styleUrls: ['./header.css']
})

export class HeaderComponent {

  currentUser:any;

  constructor(
    private router: Router
  ) {

    this.currentUser = JSON.parse(
      localStorage.getItem('currentUser') || '{}'
    );

  }

  logout(){

    localStorage.removeItem(
      'currentUser'
    );

    alert('Logout Successful');

    this.router.navigate([
      '/auth/login'
    ]);

  }

}