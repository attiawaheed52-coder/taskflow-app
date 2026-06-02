import { Component } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './forgot-password.html',

  styleUrls: ['./forgot-password.css']
})

export class ForgotPassword {

  email = '';

  newPassword = '';

  successMessage = '';

  errorMessage = '';

  api = 'http://localhost:3000/users';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  resetPassword() {

    this.successMessage = '';
    this.errorMessage = '';

    // VALIDATION
    if (!this.email || !this.newPassword) {

      this.errorMessage =
        'All fields are required ❌';

      return;
    }

    // FIND USER
    this.http.get<any[]>(`${this.api}?email=${this.email}`)
      .subscribe({

        next: (users) => {

          // USER NOT FOUND
          if (users.length === 0) {

            this.errorMessage =
              'Email not found ❌';

            return;
          }

          const user = users[0];

          // UPDATE PASSWORD
          const updatedUser = {
            ...user,
            password: this.newPassword
          };

          this.http.put(
            `${this.api}/${user.id}`,
            updatedUser
          ).subscribe({

            next: () => {

              this.successMessage =
                'Password updated successfully ✅';

              // REDIRECT AFTER 2 SEC
              setTimeout(() => {

                this.router.navigate([
                  '/auth/login'
                ]);

              }, 2000);

            },

            error: () => {

              this.errorMessage =
                'Password update failed ❌';

            }

          });

        },

        error: () => {

          this.errorMessage =
            'Something went wrong ❌';

        }

      });

  }

}