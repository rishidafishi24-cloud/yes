import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  memo,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { History } from "lucide-react";
import { companyEventsApi } from "@/api/company-events";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { NarrativeEventRow } from "./NarrativeEventRow";

const PAGE_SIZE = 50;

export interface NarrativeFeedProps {
  companyId: string;
}

export function NarrativeFeed({ companyId }: NarrativeFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: queryKeys.narrative.events(companyId),
    queryFn: ({ pageParam }) =>
      companyEventsApi.list(companyId, pageParam ?? undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    retry: false,
  });

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.events),
    [data],
  );

  const handleError = useCallback(() => {
    // Error handled by parent
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }

  if (isError || items.length === 0) {
    return (
      <EmptyState
        icon={History}
        message="No company activity events found."
      />
    );
  }

  return (
    <div className="space-y-4" aria-label="Company narrative activity">
      <ul className={cn("divide-y divide-border")} aria-label="Narrative activity">
        {items.map((event) => {
          const record = event;
          if (!record) return null;
          return (
            <NarrativeEventRow
              key={record.what}
              event={record}
            />
          );
        })}
      </ul>

      {hasNextPage && !isFetchingNextPage ? (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs text-muted-foreground hover:underline"
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}