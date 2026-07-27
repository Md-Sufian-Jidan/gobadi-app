import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface MarketItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
}

export interface Order {
  id: string;
  userId?: number | null;
  totalPrice: number;
  deliveryAddress: string;
  status: string;
  transactionId?: string;
  paymentStatus: string;
  items: Array<{ itemId: string; quantity: number }>;
  createdAt: string;
}

export const marketplaceApi = createApi({
  reducerPath: 'marketplaceApi',
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
  tagTypes: ['MarketItem', 'Order'],
  endpoints: (builder) => ({
    getCatalog: builder.query<MarketItem[], void>({
      query: () => '/marketplace',
      providesTags: (result) =>
        result
          ? [...result.map((i) => ({ type: 'MarketItem' as const, id: i.id })), { type: 'MarketItem', id: 'LIST' }]
          : [{ type: 'MarketItem', id: 'LIST' }],
    }),
    getCatalogItem: builder.query<MarketItem, string>({
      query: (id) => `/marketplace/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'MarketItem', id }],
    }),
    checkout: builder.mutation<
      Order,
      { items: Array<{ itemId: string; quantity: number }>; deliveryAddress: string }
    >({
      query: (body) => ({ url: '/marketplace/checkout', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getMyOrders: builder.query<Order[], void>({
      query: () => '/marketplace/orders/me',
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    verifyPayment: builder.mutation<Order, { orderId: string; transactionId: string }>({
      query: (body) => ({ url: '/marketplace/verify-payment', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getMyListings: builder.query<MarketItem[], void>({
      query: () => '/marketplace/listings/me',
      providesTags: (result) =>
        result
          ? [...result.map((i) => ({ type: 'MarketItem' as const, id: i.id })), { type: 'MarketItem', id: 'MY_LIST' }]
          : [{ type: 'MarketItem', id: 'MY_LIST' }],
    }),
    createListing: builder.mutation<
      MarketItem,
      { name: string; price: number; category: string; image?: string }
    >({
      query: (body) => ({ url: '/marketplace', method: 'POST', body }),
      invalidatesTags: [
        { type: 'MarketItem', id: 'LIST' },
        { type: 'MarketItem', id: 'MY_LIST' },
      ],
    }),
  }),
});

export const {
  useGetCatalogQuery,
  useGetCatalogItemQuery,
  useCheckoutMutation,
  useGetMyOrdersQuery,
  useVerifyPaymentMutation,
  useGetMyListingsQuery,
  useCreateListingMutation,
} = marketplaceApi;
