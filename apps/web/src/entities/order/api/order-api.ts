import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import type { Order } from '../model/types';

const live = { cache: 'no-store' as RequestCache };

export const fetchMyOrders = async (token: string) =>
  (await apiRequest<ApiData<Order[]>>('/orders', { token, ...live })).data;

export const fetchOrder = async (token: string, id: string) =>
  (await apiRequest<ApiData<Order>>(`/orders/${id}`, { token, ...live })).data;
