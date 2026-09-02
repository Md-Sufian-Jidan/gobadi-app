import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface Address {
  id: number;
  userId: number;
  label: string;
  contactName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressInput {
  label: string;
  contactName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const addressesApi = createApi({
  reducerPath: 'addressesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Address'],
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => '/addresses',
      providesTags: (result) =>
        result
          ? [...result.map((a) => ({ type: 'Address' as const, id: a.id })), { type: 'Address', id: 'LIST' }]
          : [{ type: 'Address', id: 'LIST' }],
    }),
    getAddress: builder.query<Address, number>({
      query: (id) => `/addresses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Address', id }],
    }),
    createAddress: builder.mutation<Address, CreateAddressInput>({
      query: (body) => ({
        url: '/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    updateAddress: builder.mutation<Address, { id: number; data: Partial<Address> }>({
      query: ({ id, data }) => ({
        url: `/addresses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),
    deleteAddress: builder.mutation<void, number>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useGetAddressQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
