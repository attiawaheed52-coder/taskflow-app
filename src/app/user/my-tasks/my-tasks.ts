import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { TaskService } from '../../core/services/task';
import { AuthService } from '../../core/services/auth';
import { SummaryPipe } from '../../core/pipes/summary-pipe';
import { HoverShadowDirective } from '../../core/directives/hover-shadow';
import { CustomModal } from '../../shared/components/custom-modal/custom-modal';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink,SummaryPipe,HoverShadowDirective,CustomModal],
  templateUrl: './my-tasks.html',
  styleUrls: ['./my-tasks.css']
})
export class MyTasksComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tasks: any[] = [];
  user: any;

  private refreshSubscription!: Subscription;

  totalTasks = 0;
  pendingTasks = 0;
  completedTasks = 0;
  overdueTasks = 0;

  // Custom Toast Message Notification States
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  // Custom Confirmation Modal States
  showDeleteModal: boolean = false;
  taskToDeleteId: any = null;

  ngOnInit(): void {
    // Current logged-in user
    this.user = this.auth.getUser();

    // Initial load
    this.getTasks();

    // Auto refresh
    this.refreshSubscription =
      this.taskService.refresh$.subscribe((shouldRefresh) => {
        if (shouldRefresh) {
          this.getTasks();
        }
      });
  }

  // Toast message trigger karne ka helper function
  triggerToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();

    // 3.5 seconds baad notification automatic hide ho jaye gi
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (data: any[]) => {
        // ✅ ONLY CURRENT USER TASKS
        const currentUserTasks = data.filter(
          (task: any) => task.email === this.user.email
        );

        this.tasks = currentUserTasks;

        // Dashboard cards counts
        this.totalTasks = currentUserTasks.length;

        this.pendingTasks =
          currentUserTasks.filter(
            (t: any) => t.status?.toLowerCase() === 'pending'
          ).length;

        this.completedTasks =
          currentUserTasks.filter(
            (t: any) => t.status?.toLowerCase() === 'completed'
          ).length;

        this.overdueTasks =
          currentUserTasks.filter(
            (t: any) => t.status?.toLowerCase() === 'overdue'
          ).length;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Tasks load error:", err);
      }
    });
  }

  // 1. Jab 'Delete' button par click hoga
  deleteTask(id: any) {
    if (!id) {
      this.triggerToast('Task ID is missing or invalid! ❌', 'error');
      return;
    }
    // Custom modal variables activate karein
    this.taskToDeleteId = id;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  // 2. Custom Modal me jab user "Yes, Delete" press kare
  confirmDelete() {
    this.showDeleteModal = false;
    const id = this.taskToDeleteId;

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.triggerToast('Task deleted successfully! 🗑️', 'success');
        this.getTasks(); // Lists update karein
        this.taskToDeleteId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Delete error:", err);
        this.triggerToast('Failed to delete task! Network Error. ❌', 'error');
        this.taskToDeleteId = null;
        this.cdr.detectChanges();
      }
    });
  }

  // 3. Custom Modal me jab user "Cancel" press kare
  cancelDelete() {
    this.showDeleteModal = false;
    this.taskToDeleteId = null;
    this.cdr.detectChanges();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}