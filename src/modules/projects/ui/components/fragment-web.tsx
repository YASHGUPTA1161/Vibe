import { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon, AlertTriangleIcon } from "lucide-react";

import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import React from "react";

interface Props {
    data: Fragment
};

export function FragmentWeb({ data }: Props) {
    const [copied, setCopied] = useState(false);
    const [fragmentKey, setFragmentKey] = useState(0);
    const [iframeError, setIframeError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

    const onRefresh = () => {
        setFragmentKey(prev => prev + 1);
        setIframeError(false);
        setIsLoading(true);
        setShowTimeoutMessage(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(data.sandboxUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleIframeError = () => {
        console.error("Iframe failed to load - likely CORS or security policy issue");
        setIframeError(true);
        setIsLoading(false);
    };

    const handleIframeLoad = () => {
        console.log("Iframe loaded successfully");
        setIframeError(false);
        setIsLoading(false);
        setShowTimeoutMessage(false);
    };

    // Show timeout message after 5 seconds
    React.useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setShowTimeoutMessage(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2"> 
                <Hint text="Refresh the preview" side="bottom">
                <Button size="sm" variant="outline" onClick={onRefresh}>
                    <RefreshCcwIcon/>
                </Button>
                </Hint>
                <Hint text="click to copy" side="bottom">
                <Button
                    size="sm" 
                    variant="outline" 
                    onClick={handleCopy}
                    disabled={!data.sandboxUrl || copied}
                    className="flix-1 justify-start text-start font-normal"
                >
                    <span className="truncate">
                        {data.sandboxUrl}
                    </span>
                </Button>
                </Hint>
                <Hint text="Open in new tab" side="bottom" align="start">
                <Button
                    size="sm" 
                    disabled={!data.sandboxUrl}
                    variant="outline" 
                    onClick={() => {
                        if (data.sandboxUrl) {
                            window.open(data.sandboxUrl, "_blank");
                        }
                    }}
                    >
                    <ExternalLinkIcon />
                    </Button>
                    </Hint>

            </div>
            
            {iframeError ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div className="space-y-4">
                        <AlertTriangleIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div>
                            <h3 className="text-lg font-semibold">Demo Preview Not Available</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                The demo cannot be displayed in the preview frame due to security restrictions.
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Don't worry! You can still view the demo by clicking the button below.
                            </p>
                        </div>
                        <Button 
                            onClick={() => window.open(data.sandboxUrl, "_blank")}
                            className="mt-4"
                        >
                            Open Demo in New Tab
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="relative flex-1">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background">
                            <div className="text-center space-y-4">
                                <div className="text-sm text-muted-foreground">Loading preview...</div>
                                {showTimeoutMessage && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-amber-500 font-medium">
                                            ⚠️ Taking too long? The demo might not display in the preview frame due to security restrictions.
                                        </div>
                                        <Button 
                                            size="sm"
                                            onClick={() => window.open(data.sandboxUrl, "_blank")}
                                            variant="outline"
                                        >
                                            Open Demo in New Tab
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <iframe
                        key={fragmentKey}
                        className="w-full h-full"
                        sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                        loading="lazy"
                        src={data.sandboxUrl}
                        onError={handleIframeError}
                        onLoad={handleIframeLoad}
                        title="Fragment Preview"
                        referrerPolicy="no-referrer"
                    />
                </div>
            )}
        </div>
    )
};