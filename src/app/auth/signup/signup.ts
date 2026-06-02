import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {

  signupForm!: FormGroup;

  // ✅ Inline alert messages ke liye variables
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['user'] // default value
    });

  }

  submit() {
    // Purane messages ko clear karein
    this.successMessage = null;
    this.errorMessage = null;

    console.log(this.signupForm.value);

    // Form validation check
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill all fields correctly! ⚠️';
      this.clearMessagesAfterDelay();
      return;
    }

    // Password matching check
    if (
      this.signupForm.value.password !==
      this.signupForm.value.confirmPassword
    ) {
      this.errorMessage = 'Passwords do not match! ❌';
      this.clearMessagesAfterDelay();
      return;
    }

    const newUser = {
      name: this.signupForm.value.name,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      role: this.signupForm.value.role
    };

    this.auth.signup(newUser).subscribe({
      next: () => {
        // ✅ ALERT KHATAM: Success inline message
        this.successMessage = 'Signup Successful! Redirecting... 🎉';
        
        // 2.5 seconds ke baad login page par redirect karein taake text nazaar aaye
        setTimeout(() => {
          this.successMessage = null;
          this.router.navigate(['/auth/login']);
        }, 2500);
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = 'Signup Failed! Email might already exist. ❌';
        this.clearMessagesAfterDelay();
      }
    });
  }

  // Messages ko automatically hide karne ka helper function
  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 3000);
  }
}