"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewJobRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/recruiter/jobs/create");
  }, [router]);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <p>Redirecting...</p>
    </div>
  );
}
