import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { TaskService } from '../../core/services/task';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  passwordForm!: FormGroup;
  user: any;
  private refreshSub!: Subscription;

  // ✅ Alert Messages State Variables
  successMessage: string | null = null;
  errorMessage: string | null = null;

  totalTasks = 0;
  pendingTasks = 0;
  completedTasks = 0;
  overdueTasks = 0;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,      
    private taskService: TaskService, 
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.user = this.auth.getUser();

    this.refreshSub = this.taskService.refresh$.subscribe((shouldRefresh) => {
      if (shouldRefresh) {
        this.loadTaskStats();
      }
    });
  }

  loadTaskStats() {
    this.taskService.getTasks().subscribe({
      next: (data: any[]) => {
        this.totalTasks = data.length;
        this.pendingTasks = data.filter((t: any) => t.status?.toLowerCase() === 'pending').length;
        this.completedTasks = data.filter((t: any) => t.status?.toLowerCase() === 'completed').length;
        this.overdueTasks = data.filter((t: any) => t.status?.toLowerCase() === 'overdue').length;
      },
      error: (err) => console.error("Stats load karne mein masla aya:", err)
    });
  }

  changePassword() {
    // Purane messages ko clear karein
    this.successMessage = null;
    this.errorMessage = null;

    if (this.passwordForm.invalid) {
      this.errorMessage = 'Please fill all fields! ⚠️';
      this.clearMessagesAfterDelay();
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);

    if (!currentUser || this.passwordForm.value.currentPassword !== currentUser.password) {
      // ✅ ALERT KHATAM: Error state update
      this.errorMessage = 'Current Password Incorrect! ❌';
      this.clearMessagesAfterDelay();
      return;
    }

    // Password update process
    currentUser.password = this.passwordForm.value.newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // ✅ ALERT KHATAM: Success state update
    this.successMessage = 'Password Updated Successfully! 🔑';
    this.passwordForm.reset();
    this.clearMessagesAfterDelay();
  }

  // ✅ Messages ko 3 seconds baad automatic hide karne ka helper function
  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 3000);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }
}