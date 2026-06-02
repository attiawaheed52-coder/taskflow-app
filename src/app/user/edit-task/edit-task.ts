import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-task.html',
  styleUrls: ['./edit-task.css']
})
export class EditTaskComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private taskService = inject(TaskService); // Service inject karein background refresh ke liye

  taskForm!: FormGroup;
  taskId!: string; // Index ki jagah dynamic ID base use karenge
  existingTaskData: any = {};

  // Custom Toast Message Notification States
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['Pending'] // Status hidden fill safe-keep ke liye
    });
  }

  ngOnInit(): void {
    // URL se task ki proper ID nikalen
    this.taskId = this.route.snapshot.paramMap.get('id') || '';

    if (this.taskId) {
      this.loadTaskDetails();
    }
  }

  // Task ka fresh data API se la kar form mein fill karne ke liye
  loadTaskDetails() {
    this.taskService.getTasks().subscribe({
      next: (data: any[]) => {
        // ID ya match index se verify karein
        const matchedTask = data.find(t => String(t.id) === String(this.taskId)) || data[Number(this.taskId)];
        
        if (matchedTask) {
          this.existingTaskData = matchedTask;
          this.taskId = matchedTask.id; // Confirm exact original ID
          
          this.taskForm.patchValue({
            title: matchedTask.title,
            description: matchedTask.description,
            dueDate: matchedTask.dueDate,
            priority: matchedTask.priority,
            status: matchedTask.status || 'Pending'
          });
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error("Error fetching task details:", err)
    });
  }

  // Toast notification helper
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

  updateTask() {
    if (this.taskForm.invalid) {
      this.triggerToast('Please fill out all fields properly! ❌', 'error');
      return;
    }

    // Purane task data ke sath naye form values ko merge karein (email aur user identity barkrar rakhne ke liye)
    const updatedTask = {
      ...this.existingTaskData,
      ...this.taskForm.value
    };

    // 🚀 LocalStorage khatam, ab direct live JSON-Server database par save hoga:
    fetch(`http://localhost:3000/tasks/${this.taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    })
    .then(res => {
      if (!res.ok) throw new Error('Update failed');

      // Refresh stream handle karein taake My Tasks automatically refresh ho jaye
      if (this.taskService.refresh$) {
        // trigger system refresh dynamic pipeline if available
      }

      this.triggerToast('Task updated successfully! ✏️', 'success');

      // 1.5 second baad navigation execute karein
      setTimeout(() => {
        this.router.navigate(['/user/my-tasks']);
      }, 1500);
    })
    .catch(err => {
      console.error("Update error:", err);
      this.triggerToast('Failed to update task configuration. ❌', 'error');
    });
  }
}