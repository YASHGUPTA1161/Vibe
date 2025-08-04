import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Usage } from "./usage";
import { useRouter } from "next/navigation";



interface props {
    projectId: string;
}

const formSchema = z.object({
    value: z.string()
    .min(1, {message: "Value is required"})
    .max(1000, {message: "Value is too long"})
})

export const MessageForm = ({projectId}: props) => {
    const router = useRouter();
    const trpc = useTRPC();
    const QueryClient = useQueryClient();

    const { data: usage } = useQuery(trpc.usage.status.queryOptions());
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        },
    });
    
    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onSuccess: () => {
            form.reset();
            QueryClient.invalidateQueries(
                trpc.messages.getMany.queryOptions({ projectId}),
            );
            QueryClient.invalidateQueries(
                trpc.usage.status.queryOptions(),
            );
        },
        onError: (error) => {
            toast.error(error.message);

            if (error.data?.code === "TOO_MANY_REQUESTS") {
                router.push("/pricing");
            }
        },
    }));
    
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Check credits before sending request - minimum 3 credits required
        if (usage && usage.remainingPoints < 3) {
            toast.error("Minimum 3 credits required to generate. Please upgrade to continue.");
            router.push("/pricing");
            return;
        }
        
        await createMessage.mutateAsync({
            value: values.value,
            projectId,
        });
    };
    
    const [isFocused, setIsFocused] = useState(false);
    const isPending = createMessage.isPending;
    const hasEnoughCredits = usage ? usage.remainingPoints >= 3 : true;
    const isButtonDisabled = isPending || !form.formState.isValid || !hasEnoughCredits;
    const showUsage = !!usage;


    return (
        <Form {...form}>
            {showUsage && 
            <Usage points={usage.remainingPoints} 
            msBeforeNext={usage.msBeforeNext} 
            />}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                    isFocused && "shadow-xs",
                    showUsage && "rounded-t-none",
                )}
                >
                    <FormField 
                        control={form.control}
                        name="value"
                        render={({field}) => (
                            <TextareaAutosize                        
                                {...field}
                                disabled={isPending || !hasEnoughCredits}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                minRows={2}
                                maxRows={8}
                                className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                                placeholder={!hasEnoughCredits ? "Minimum 3 credits required" : "What would you like to build?"}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                        e.preventDefault();
                                        if (hasEnoughCredits) {
                                            form.handleSubmit(onSubmit)(e);
                                        }
                                    }
                                }}
                            />
                        )}
                    />
                    <div className="flex gap-x-2 items-end justify-between pt-2">
                        <div className="flex flex-col gap-1">
                            <div className="text-[10px] text-muted-foreground font-mono">
                                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ">
                                    <span>&#8984;</span>Enter
                                </kbd>
                                &nbsp;to submit
                            </div>
                            {usage && usage.remainingPoints < 3 && usage.remainingPoints > 0 && (
                                <div className="text-[10px] text-orange-500">
                                    ⚠️ Minimum 3 credits required
                                </div>
                            )}
                            {usage && usage.remainingPoints === 0 && (
                                <div className="text-[10px] text-red-500">
                                    ❌ No credits remaining
                                </div>
                            )}
                        </div>
                        <button
                        disabled={isButtonDisabled}
                        className={cn(
                            "size-8 rounded-full",
                              isButtonDisabled && "bg-muted-foreground border"
                        )}
                        title={!hasEnoughCredits ? "Minimum 3 credits required" : ""}
                        >
                            {isPending ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                            <ArrowUpIcon />
                            )}
                        </button>
                    </div>
                </form>
        </Form>
    );
};