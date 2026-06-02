import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth';

import { TaskService } from '../../core/services/task';

@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],

  templateUrl: './dashboard.html',

  styleUrls: ['./dashboard.css']
})

export class Dashboard
implements OnInit {

  user: any;

  tasks: any[] = [];

  totalTasks = 0;

  pendingTasks = 0;

  completedTasks = 0;

  overdueTasks = 0;

  constructor(
    private auth: AuthService,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {

    this.user =
      this.auth.getUser();

    this.loadTasks();

  }

  // LOAD TASKS
  loadTasks() {

    this.taskService.getTasks().subscribe({

      next: (data: any[]) => {

        this.tasks = data;

        this.totalTasks =
          data.length;

        this.pendingTasks =
          data.filter(
            t => t.status === 'Pending'
          ).length;

        this.completedTasks =
          data.filter(
            t => t.status === 'Completed'
          ).length;

        this.overdueTasks =
          data.filter(
            t => t.status === 'Overdue'
          ).length;

      }

    });

  }

  // CHANGE STATUS
  changeStatus(task: any, status: string) {

    task.status = status;

    this.taskService.updateTask(
      task.id,
      task
    ).subscribe(() => {

      this.loadTasks();

    });

  }

  // CHANGE PRIORITY
  changePriority(
    task: any,
    priority: string
  ) {

    task.priority = priority;

    this.taskService.updateTask(
      task.id,
      task
    ).subscribe();

  }

  // LOGOUT
  logout() {

    this.auth.logout();

    this.router.navigate([
      '/auth/login'
    ]);

  }

}