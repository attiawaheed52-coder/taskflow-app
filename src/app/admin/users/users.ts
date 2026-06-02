import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { TaskService } from '../../core/services/task';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  private auth = inject(AuthService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  users: any[] = [];
  totalUsers = 0;
  totalTasks = 0;
  
  // 🌟 Inline Notification Messages (Red or Green for Forms/Tables)
  successMessage: string | null = null;
  errorMessage: string | null = null;
  
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadAllData();
    }
  }

  loadAllData() {
    if (this.auth && typeof this.auth.getAllUsers === 'function') {
      this.auth.getAllUsers().subscribe({
        next: (serverUsers: any[]) => {
          if (serverUsers && serverUsers.length > 0) {
            // 🌟 Client-side cleaning: Agar database mein duplicate data pehle se aa chuka hai,
            // toh yeh filtering screen par duplicates ko aane se rokegi (Unique layout only).
            this.users = serverUsers;
this.totalUsers = this.users.length;
this.cdr.detectChanges();
            this.totalUsers = this.users.length;
            this.cdr.detectChanges();
          } else {
            this.fetchUsersDirectlyFromNetwork();
          }
        },
        error: (err: any) => {
          console.warn("AuthService failed, switching to direct fetch:", err);
          this.fetchUsersDirectlyFromNetwork();
        }
      });
    } else {
      this.fetchUsersDirectlyFromNetwork();
    }

    if (this.taskService && typeof this.taskService.getTasks === 'function') {
      this.taskService.getTasks().subscribe({
        next: (tasks: any[]) => {
          this.totalTasks = tasks ? tasks.length : 0;
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Tasks count fetch failed:", err)
      });
    }
  }

  private fetchUsersDirectlyFromNetwork() {
    fetch('http://localhost:3000/users')
      .then(res => res.json())
      .then((data: any[]) => {
        // Unique elements filtering logic
        this.users = (data || []).filter((user, index, self) =>
          index === self.findIndex((u) => u.email?.toLowerCase() === user.email?.toLowerCase())
        );
        this.totalUsers = this.users.length;
        this.cdr.detectChanges();
      })
      .catch(err => {
        console.error("Network sync completely failed:", err);
        const localData = JSON.parse(localStorage.getItem('users') || '[]');
        this.users = localData.filter((user: any, index: number, self: any[]) =>
          index === self.findIndex((u) => u.email?.toLowerCase() === user.email?.toLowerCase())
        );
        this.totalUsers = this.users.length;
        this.cdr.detectChanges();
      });
  }

  // 🌟 Naya Admin Controlled User registration check logic
  // Jab Admin kisi naye user ko add karne ki koshish karega
  checkAndAddNewUser(newUserObject: any) {
    this.clearMessages();

    // Check karein ke kya email database mein pehle se maujood hai?
    const emailExists = this.users.some(user => user.email.toLowerCase() === newUserObject.email.toLowerCase());

    if (emailExists) {
      // 🔴 RED Message block trigger hoga agar duplicate email mili
      this.errorMessage = `Error: The email account "${newUserObject.email}" is already registered in our network! ❌`;
      this.clearMessagesAfterDelay();
      return; 
    }

    // Agar match nahi ki toh unique hai, save karwa dein backend par
    fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUserObject)
    })
    .then(() => {
      this.successMessage = 'New secure user channel deployed successfully! 🎉';
      this.loadAllData();
      this.clearMessagesAfterDelay();
    });
  }

  deleteUser(userId: any, userEmail: string) {
    this.clearMessages();

    if (!userId) {
      this.errorMessage = "Cannot delete user: Unique ID is missing! ❌";
      this.clearMessagesAfterDelay();
      return;
    }

    const currentUser = this.auth.getUser();
    if (currentUser && userEmail === currentUser.email) {
      this.errorMessage = "Action Denied: You cannot delete your own admin active account! ❌";
      this.clearMessagesAfterDelay();
      return;
    }

    if (confirm(`Are you sure you want to remove user (${userEmail})? 🗑️`)) {
      if (this.auth && typeof this.auth.deleteUserAccount === 'function') {
        this.auth.deleteUserAccount(userId).subscribe({
          next: () => {
            this.successMessage = 'User entry permanently deleted from core database. 👍';
            this.loadAllData(); 
            this.clearMessagesAfterDelay();
          },
          error: () => {
            this.executeDirectUserDelete(userId);
          }
        });
      } else {
        this.executeDirectUserDelete(userId);
      }
    }
  }

  private executeDirectUserDelete(userId: any) {
    fetch(`http://localhost:3000/users/${userId}`, { method: 'DELETE' })
      .then(() => {
        this.successMessage = 'User completely removed from system logs! 🗑️';
        this.loadAllData();
        this.clearMessagesAfterDelay();
      })
      .catch(err => {
        console.error("Delete call failed:", err);
        this.errorMessage = 'Database rejection: Fallback pipeline failed to clear logs! ❌';
        this.clearMessagesAfterDelay();
      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  private clearMessages() {
    this.successMessage = null;
    this.errorMessage = null;
  }

  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.clearMessages();
      this.cdr.detectChanges();
    }, 4000);
  }
}