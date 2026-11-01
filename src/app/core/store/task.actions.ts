import { createAction, props } from '@ngrx/store';

// Actions ki list
export const loadTasksSuccess = createAction(
  '[Task API] Load Tasks Success',
  props<{ tasks: any[] }>()
);

export const deleteLocalTask = createAction(
  '[Task Page] Delete Task',
  props<{ id: string }>()
);