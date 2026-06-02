import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Form Invalid! Please check fields ❌';
      this.clearMessagesAfterDelay();
      return;
    }

    const { email, password } = this.loginForm.value;
    const cleanEmail = email.trim().toLowerCase(); // Normalize input for dynamic safety

    this.auth.login(cleanEmail, password).subscribe({
      next: (users: any[]) => {
        // 🌟 Unique identifier check with case insensitivity
        const user = users.find(
          (u: any) => u.email?.trim().toLowerCase() === cleanEmail && u.password === password
        );

        // INVALID
        if (!user) {
          this.errorMessage = 'Invalid Credentials! Please try again. ❌';
          this.clearMessagesAfterDelay();
          return;
        }

        // SAVE USER SESSION
        this.auth.saveUser(user);
        localStorage.setItem('role', user.role);

        // SUCCESS
        this.successMessage = 'Login Successful! Welcome Back ✅';

        // ROUTING PARADIGM
        setTimeout(() => {
          if (user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        }, 1500);
      },
      error: (err) => {
        console.error("Login component error pool:", err);
        this.errorMessage = 'Network connection failed! ❌';
        this.clearMessagesAfterDelay();
      }
    });
  }

  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 3000);
  }
}