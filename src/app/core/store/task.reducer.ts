import { createReducer, on } from '@ngrx/store';
import * as TaskActions from './task.actions';

// Initial state ka dabba kaisa dikhay ga
export interface TaskState {
  tasks: any[];
}

export const initialState: TaskState = {
  tasks: []
};

// Reducer functions
export const taskReducer = createReducer(
  initialState,
  
  // 1. Jab tasks backend se load ho jayen
  on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks: tasks
  })),

  // 2. Jab task delete ho jaye
  on(TaskActions.deleteLocalTask, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter(task => task.id !== id)
  }))
);