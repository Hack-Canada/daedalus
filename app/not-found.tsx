import { ApplyMark } from "@/components/apply/ApplyMark";
import { EmptyPage } from "@/components/EmptyPage";

export default function NotFound() {
  return (
    <>
      <ApplyMark />
      <EmptyPage
        title="Page not found"
        message="We couldn't find that page. The link might be old or mistyped."
      />
    </>
  );
}
