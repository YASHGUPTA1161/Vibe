import { getQueryClient , trpc} from "@/trpc/server";
import { dehydrate, HydrationBoundary} from "@tanstack/react-query";
import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface props {
    params: Promise<{
        projectId: string;
    }>
};

const page = async ({params}: props) => {
    const { projectId } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id: projectId,
    }));
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId,
    }));
    
    /* DEBUGGING START: Added console.log to confirm the project page loads with correct ID */
    console.log("Project page loaded with ID:", projectId); // --->
    /* DEBUGGING END */

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary fallback={<p>Error</p>}>
            <Suspense fallback={<p>Loading...</p>}>
                <ProjectView projectId={projectId} />
            </Suspense>
            </ErrorBoundary>
        </HydrationBoundary>
    );
}

export default page;