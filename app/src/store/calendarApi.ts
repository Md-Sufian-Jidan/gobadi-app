import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface CalendarDay {
  date: string;
  appointmentCount: number;
  hasBlockTime: boolean;
}

export interface CalendarAppointment {
  id: number;
  doctorName: string;
  patientName: string;
  startAt: string;
  endAt: string;
  status: string;
  type: string;
}

export interface CalendarBadge {
  date: string;
  count: number;
}

export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CalendarEvent'],
  endpoints: (builder) => ({
    getDoctorMonthlyCalendar: builder.query<CalendarDay[], { doctorId: number; month: string; year: string }>({
      query: ({ doctorId, month, year }) => ({
        url: `/calendar/doctor/${doctorId}`,
        params: { month, year },
      }),
      providesTags: ['CalendarEvent'],
    }),
    getDoctorWeeklyCalendar: builder.query<CalendarDay[], { doctorId: number; date: string }>({
      query: ({ doctorId, date }) => ({
        url: `/calendar/doctor/${doctorId}/week`,
        params: { date },
      }),
      providesTags: ['CalendarEvent'],
    }),
    getUserAppointments: builder.query<CalendarAppointment[], { date: string; view: 'day' | 'week' | 'month' }>({
      query: (params) => ({
        url: '/calendar/appointments',
        params,
      }),
      providesTags: ['CalendarEvent'],
    }),
    getBadges: builder.query<CalendarBadge[], { month: string; year: string }>({
      query: (params) => ({
        url: '/calendar/badges',
        params,
      }),
      providesTags: ['CalendarEvent'],
    }),
  }),
});

export const {
  useGetDoctorMonthlyCalendarQuery,
  useGetDoctorWeeklyCalendarQuery,
  useGetUserAppointmentsQuery,
  useGetBadgesQuery,
} = calendarApi;
