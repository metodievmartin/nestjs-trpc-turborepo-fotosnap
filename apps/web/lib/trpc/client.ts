import { AppRouter } from '@repo/trpc/router';
import {
  CreateTRPCReact,
  createTRPCReact,
  httpBatchLink,
} from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';

export const trpc: CreateTRPCReact<AppRouter, object> = createTRPCReact<
  AppRouter,
  object
>();

export const queryClient = new QueryClient();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});
