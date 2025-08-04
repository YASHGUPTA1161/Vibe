"use client";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";


import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { EyeIcon, CodeIcon, CrownIcon } from "lucide-react";
import { CodeView } from "@/components/code-view";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";


interface Props {
    projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {

    const { has } = useAuth();
    const hasProAccess = has?.({plan: "pro"});

    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<"Preview" | "code">("Preview");

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <ErrorBoundary fallback={<p>Project Header Error</p>}>
                    <Suspense fallback={<p>Loading Project Header...</p>}>
                     <ProjectHeader projectId={projectId} />
                    </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<p>Messages Container Error</p>}>
                    <Suspense fallback={<p>Loading Messages...</p>}>
                        <MessagesContainer
                        projectId={projectId}
                        activeFragment={activeFragment}
                        setActiveFragment={setActiveFragment}
                        />
                    </Suspense>
                        </ErrorBoundary>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                >
                    <Tabs
                        className="h-full gap-y-0"
                        defaultValue="Preview"
                        value={tabState}
                        onValueChange={(value) => setTabState(value as "Preview" | "code")}
                    >
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="Preview" className="rounded-md">
                                <EyeIcon /> <span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-md">
                                <EyeIcon /> <span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasProAccess && (
                            <Button asChild size="sm" variant="tertiary">
                                <Link href={"/pricing"}>
                                <CrownIcon /> Upgrade
                                </Link>
                                </Button>
                                )}
                                <UserControl />
                            </div>
                        </div>
                        <TabsContent value="Preview">
                    {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment?.files && (
                                <FileExplorer
                                    files={activeFragment.files as { [path: string]: string }}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};