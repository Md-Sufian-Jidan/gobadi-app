import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface Task {
  id: number;
  userId: number;
  title: string;
  detail?: string;
  scheduledTime: string;
  isDone: boolean;
}

export interface NewTask {
  title: string;
  detail?: string;
  scheduledTime: string;
}

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], string>({
      query: (date) => `/tasks?date=${date}`,
      providesTags: (result) =>
        result
          ? [...result.map((t) => ({ type: 'Task' as const, id: t.id })), { type: 'Task', id: 'LIST' }]
          : [{ type: 'Task', id: 'LIST' }],
    }),
    createTask: builder.mutation<Task, NewTask>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),
    toggleTask: builder.mutation<Task, string>({
      query: (id) => ({ url: `/tasks/${id}/toggle`, method: 'PATCH' }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patches: { undo: () => void }[] = [];
        const state = getState() as any;
        for (const key of tasksApi.util.selectCachedArgsForQuery(state, 'getTasks')) {
          const patch = dispatch(
            tasksApi.util.updateQueryData('getTasks', key, (draft) => {
              const task = draft.find((t) => String(t.id) === id);
              if (task) task.isDone = !task.isDone;
            }),
          );
          patches.push(patch);
        }
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),
    deleteTask: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
    updateTask: builder.mutation<Task, { id: number; title: string; detail?: string; scheduledTime?: string }>({
      query: ({ id, ...body }) => ({ url: `/tasks/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useToggleTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} = tasksApi;
