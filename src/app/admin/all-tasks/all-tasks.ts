import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../core/services/auth';
import { TaskService } from '../../core/services/task';

// 🚀 Naye tools import kiye jo humne banaye hain (Paths apne folder structure ke mutabiq verify kar lein)
import { SummaryPipe } from '../../core/pipes/summary-pipe';
import { HoverShadowDirective } from '../../core/directives/hover-shadow';
import { CustomModal } from '../../shared/components/custom-modal/custom-modal';

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  // ✅ Imports array mein naye pipes, directives aur custom modal ko shamil kar diya
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    FormsModule,
    SummaryPipe,
    HoverShadowDirective,
    CustomModal
  ],
  templateUrl: './all-tasks.html',
  styleUrls: ['./all-tasks.css']
})
export class AllTasksComponent implements OnInit {
  private auth = inject(AuthService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  tasks: any[] = [];
  groupedTasks: { email: string, tasks: any[] }[] = [];
  totalUsers = 0;
  totalTasks = 0;
  
  isEditing = false;
  selectedTask: any = {};
  private isBrowser: boolean;

  // Custom Toast States
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Custom Confirmation Modal States
  showDeleteModal = false;
  taskToDeleteId: any = null;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadAllGlobalTasks();
    }
  }

  triggerToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  groupTasksByEmail(): void {
    const groups = this.tasks.reduce((acc, task) => {
      const email = task.email || 'system.sync@taskflow.com';
      if (!acc[email]) {
        acc[email] = [];
      }
      acc[email].push(task);
      return acc;
    }, {} as { [key: string]: any[] });

    this.groupedTasks = Object.keys(groups).map(email => ({
      email: email,
      tasks: groups[email]
    }));
  }

  loadAllGlobalTasks(): void {
    if (this.taskService && typeof this.taskService.getTasks === 'function') {
      this.taskService.getTasks().subscribe({
        next: (data: any[]) => {
          this.tasks = data || [];
          this.totalTasks = this.tasks.length;
          this.groupTasksByEmail();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Global tasks fetch error:", err);
          this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
          this.totalTasks = this.tasks.length;
          this.groupTasksByEmail();
          this.cdr.detectChanges();
        }
      });
    } else {
      fetch('http://localhost:3000/tasks')
        .then(res => res.json())
        .then((data: any[]) => {
          this.tasks = data || [];
          this.totalTasks = this.tasks.length;
          this.groupTasksByEmail();
          this.cdr.detectChanges();
        });
    }

    if (this.auth && typeof this.auth.getAllUsers === 'function') {
      this.auth.getAllUsers().subscribe({
        next: (serverUsers: any[]) => {
          this.totalUsers = serverUsers ? serverUsers.length : 0;
          this.cdr.detectChanges();
        },
        error: () => {
          const usersList = JSON.parse(localStorage.getItem('users') || '[]');
          this.totalUsers = usersList.length;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteAdminTask(taskId: any): void {
    if (!taskId) {
      this.triggerToast('Task ID is missing or invalid! ❌', 'error');
      return;
    }
    this.taskToDeleteId = taskId;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    this.showDeleteModal = false;
    const taskId = this.taskToDeleteId;

    if (this.taskService && typeof this.taskService.deleteTask === 'function') {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.triggerToast('Task permanently deleted by Admin. 👍', 'success');
          this.loadAllGlobalTasks(); 
          this.taskToDeleteId = null;
        },
        error: (err) => {
          console.error("Switching to direct network wipe execution:", err);
          this.executeDirectDeleteFetch(taskId);
        }
      });
    } else {
      this.executeDirectDeleteFetch(taskId);
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.taskToDeleteId = null;
    this.cdr.detectChanges();
  }

  private executeDirectDeleteFetch(taskId: any): void {
    fetch(`http://localhost:3000/tasks/${taskId}`, { method: 'DELETE' })
      .then(() => {
        this.triggerToast('Task deleted successfully! (Network Sync) 🗑️', 'success');
        this.loadAllGlobalTasks();
        this.taskToDeleteId = null;
      })
      .catch(err => {
        console.error("Network fallback failed:", err);
        this.triggerToast('Failed to delete task. Network Error! ❌', 'error');
        this.taskToDeleteId = null;
      });
  }

  editTask(task: any): void {
    this.selectedTask = { ...task }; 
    this.isEditing = true;
    this.cdr.detectChanges();
  }

  saveTaskUpdate(): void {
    if (!this.selectedTask.title || !this.selectedTask.description) {
      this.triggerToast('Please fill out all the fields! ❌', 'error');
      return;
    }

    if (!this.selectedTask.email) {
      this.selectedTask.email = 'system.sync@taskflow.com';
    }

    fetch(`http://localhost:3000/tasks/${this.selectedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.selectedTask)
    })
    .then(() => {
      this.triggerToast('Task logs and Owner configurations updated by Admin! ✏️', 'success');
      this.isEditing = false;
      this.loadAllGlobalTasks(); 
    })
    .catch(err => {
      console.error("Failed to update task via PUT connection pool:", err);
      this.triggerToast('Failed to update configuration! Network error. ❌', 'error');
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}