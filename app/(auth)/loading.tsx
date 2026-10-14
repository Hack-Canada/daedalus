import { Skeleton } from "@/components/ui/skeleton";
import AuthCardWrapper from "@/components/auth/AuthCardWrapper";

export default function Loading() {
  return (
    <AuthCardWrapper showTabs={false}>
      <div className="space-y-3">
        <Skeleton className="h-10 w-56 bg-white/10" />
        <Skeleton className="h-4 w-64 bg-white/5" />
      </div>

      <div className="space-y-5">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16 bg-white/10" />
            <Skeleton className="h-11 w-full bg-white/5" />
          </div>
        ))}
        <Skeleton className="h-11 w-full rounded-full bg-[#85B7F1]/20" />
      </div>
    </AuthCardWrapper>
  );
}
