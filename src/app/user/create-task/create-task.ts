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
  selector: 'app-create-task',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './create-task.html',

  styleUrls: ['./create-task.css']
})

export class CreateTaskComponent
implements OnInit, OnDestroy {

  taskForm!: FormGroup;

  user: any;

  private refreshSub!: Subscription;

  // Inline Messages
  successMessage: string | null = null;

  errorMessage: string | null = null;

  // Dashboard Stats
  totalTasks = 0;

  pendingTasks = 0;

  completedTasks = 0;

  overdueTasks = 0;

  constructor(
    private fb: FormBuilder,

    private taskService: TaskService,

    private auth: AuthService,

    private router: Router
  ) {

    this.taskForm = this.fb.group({

      title: [
        '',
        Validators.required
      ],

      description: [
        '',
        Validators.required
      ],

      dueDate: [
        '',
        Validators.required
      ],

      priority: [
        '',
        Validators.required
      ],

      status: [
        'Pending'
      ]

    });

  }

  ngOnInit() {

    // Current logged-in user
    this.user = this.auth.getUser();

    // Initial stats load
    this.loadTaskStats();

    // Auto refresh
    this.refreshSub =
      this.taskService.refresh$
      .subscribe((shouldRefresh) => {

        if (shouldRefresh) {

          this.loadTaskStats();

        }

      });

  }

  // Dashboard cards stats
  loadTaskStats() {

    this.taskService.getTasks().subscribe({

      next: (data: any[]) => {

        // ✅ ONLY CURRENT USER TASKS
        const userTasks = data.filter(

          (task: any) =>

            task.email === this.user.email

        );

        this.totalTasks =
          userTasks.length;

        this.pendingTasks =
          userTasks.filter(

            (t: any) =>

              t.status?.toLowerCase()
              === 'pending'

          ).length;

        this.completedTasks =
          userTasks.filter(

            (t: any) =>

              t.status?.toLowerCase()
              === 'completed'

          ).length;

        this.overdueTasks =
          userTasks.filter(

            (t: any) =>

              t.status?.toLowerCase()
              === 'overdue'

          ).length;

      },

      error: (err) => {

        console.error(
          "Stats load error:",
          err
        );

      }

    });

  }

  submit() {

    // Clear old messages
    this.successMessage = null;

    this.errorMessage = null;

    // Form validation
    if (this.taskForm.invalid) {

      this.errorMessage =
        'Please fill all required fields! ⚠️';

      this.clearMessagesAfterDelay();

      return;

    }

    // Current logged-in user
    const currentUser =
      this.auth.getUser();

    // Task payload
    const taskPayload = {

      ...this.taskForm.value,

      // ✅ Current user email save
      email: currentUser
        ? currentUser.email
        : 'unknown@taskflow.com'

    };

    // Save task
    this.taskService
      .addTask(taskPayload)
      .subscribe({

        next: () => {

          this.successMessage =
            'Task Created Successfully! 🎉';

          // Refresh all pages
          this.taskService.notifyRefresh();

          // Update cards instantly
          this.loadTaskStats();

          // Reset form
          this.taskForm.reset({

            status: 'Pending'

          });

          // Redirect
          setTimeout(() => {

            this.successMessage = null;

            this.router.navigate([
              '/user/my-tasks'
            ]);

          }, 2500);

        },

        error: (err) => {

          console.error(
            "Task create error:",
            err
          );

          this.errorMessage =
            'Something went wrong while creating task! ❌';

          this.clearMessagesAfterDelay();

        }

      });

  }

  // Auto hide messages
  private clearMessagesAfterDelay() {

    setTimeout(() => {

      this.successMessage = null;

      this.errorMessage = null;

    }, 3000);

  }

  logout() {

    this.auth.logout();

    this.router.navigate([
      '/auth/login'
    ]);

  }

  ngOnDestroy(): void {

    if (this.refreshSub) {

      this.refreshSub.unsubscribe();

    }

  }

}