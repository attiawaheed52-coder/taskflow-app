import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { TaskService } from '../../core/services/task';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  totalUsers = 0;
  totalTasks = 0;
  adminUser: any;
  private refreshSub!: Subscription;
  private isBrowser: boolean;

  constructor(
    private auth: AuthService,
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef, // ✅ Added ChangeDetectorRef to fix NG0100
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.adminUser = this.auth.getUser();
      this.loadAdminStats();

      if (this.taskService && this.taskService.refresh$) {
        this.refreshSub = this.taskService.refresh$.subscribe((shouldRefresh) => {
          if (shouldRefresh) {
            this.loadAdminStats();
          }
        });
      }
    }
  }

  loadAdminStats() {
    if (!this.isBrowser) return;

    // 1. Total global tasks fetch from db.json
    if (this.taskService && typeof this.taskService.getTasks === 'function') {
      this.taskService.getTasks().subscribe({
        next: (tasks: any[]) => {
          this.totalTasks = tasks ? tasks.length : 0;
          this.cdr.detectChanges(); // ✅ Tell Angular to safely update view state
        },
        error: (err) => console.error("Admin tasks fetch failed:", err)
      });
    }

    // 2. Users count fetch from db.json dynamically
    if (this.auth && typeof this.auth.getAllUsers === 'function') {
      this.auth.getAllUsers().subscribe({
        next: (serverUsers: any[]) => {
          this.totalUsers = serverUsers ? serverUsers.length : 0;
          this.cdr.detectChanges(); // ✅ Tell Angular to safely update view state
        },
        error: (err: any) => {
          console.error("Dashboard users fetch failed:", err);
          // Fallback to local storage
          const usersList = JSON.parse(localStorage.getItem('users') || '[]');
          this.totalUsers = usersList.length;
          this.cdr.detectChanges();
        }
      });
    }
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