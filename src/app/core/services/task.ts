import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private api = 'http://localhost:3000/tasks';

  // ✅ Refresh State track karne ke liye
  private refreshSubject = new BehaviorSubject<boolean>(true); // Default true rakhein taake pehli baar load ho
  refresh$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  notifyRefresh() {
    this.refreshSubject.next(true);
  }

  // GET TASKS
  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  // ADD TASK
  addTask(task: any): Observable<any> {
    return this.http.post<any>(this.api, task).pipe(
      tap(() => this.notifyRefresh()) // ✅ Task add hote hi sabko batao
    );
  }

  // DELETE TASK
  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`).pipe(
      tap(() => this.notifyRefresh()) // ✅ Task delete hote hi sabko batao
    );
  }

  // UPDATE TASK
  updateTask(id: number, task: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, task).pipe(
      tap(() => this.notifyRefresh()) // ✅ Task update hote hi sabko batao
    );
  }
}