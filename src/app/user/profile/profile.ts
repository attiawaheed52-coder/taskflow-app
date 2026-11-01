import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { TaskService } from '../../core/services/task';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  profileForm!: FormGroup;
  user: any;
  private refreshSub!: Subscription;

  // ✅ Green text message store karne ke liye variable
  successMessage: string | null = null;

  // Dashboard cards ke liye variables
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
    this.profileForm = this.fb.group({
      name: [''],
      email: ['']
    });
  }

  ngOnInit(): void {
    this.user = this.auth.getUser();

    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email
      });
    }

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
      }
    });
  }

  updateProfile() {
    this.user.name = this.profileForm.value.name;
    this.user.email = this.profileForm.value.email;

    localStorage.setItem('currentUser', JSON.stringify(this.user));

    // ✅ ALERT KHATAM: Ab text message set hoga
    this.successMessage = 'Profile Updated Successfully! 🎉';

    // ✅ 3 Seconds baad message ko auto-hide karne ke liye
    setTimeout(() => {
      this.successMessage = null;
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