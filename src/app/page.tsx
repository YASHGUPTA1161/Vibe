"use client"
import { useMutation} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [value, setValue] = useState("");

  const trpc = useTRPC();
  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onError: (error) => {
      /* DEBUGGING START: Added console.error to track mutation failures */
      console.error("Mutation error:", error); // --->
      /* DEBUGGING END */
      toast.error(error.message);
    },
    onSuccess: (data) => {
      /* DEBUGGING START: Added console logs to track successful mutation and redirect */
      console.log("Mutation success, data:", data); // --->
      console.log("Project ID:", data.id); // --->
      console.log("Redirecting to:", `/projects/${data.id}`); // --->
      /* DEBUGGING END */
      
      // Try router.push first
      router.push(`/projects/${data.id}`);
      
      /* DEBUGGING START: Added fallback navigation in case router.push fails */
      /* This was added because sometimes Next.js router doesn't work immediately */
      setTimeout(() => {
        if (window.location.pathname !== `/projects/${data.id}`) {
          console.log("Router didn't work, using window.location"); // --->
          window.location.href = `/projects/${data.id}`; // --->
        }
      }, 1000);
      /* DEBUGGING END */
    },
  }));

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center">
        <input value={value} onChange={(e) => setValue(e.target.value)}/>
        <Button
          disabled={createProject.isPending}
          onClick={() => {
            /* DEBUGGING START: Added console.log to track when form is submitted */
            console.log("Submitting value:", value); // --->
            /* DEBUGGING END */
            createProject.mutate({ value: value });
          }}
          >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Page;