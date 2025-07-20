interface props {
    params: Promise<{
        projectId: string;
    }>
};

const page = async ({params}: props) => {
    const { projectId } = await params;
    
    /* DEBUGGING START: Added console.log to confirm the project page loads with correct ID */
    console.log("Project page loaded with ID:", projectId); // --->
    /* DEBUGGING END */

    return (
        <div className="p-8">
            {/* DEBUGGING START: Enhanced the UI to show more project details and confirm page loads */}
            <h1 className="text-2xl font-bold mb-4">Project Details</h1> {/* ---> */}
            <div className="bg-gray-100 p-4 rounded"> {/* ---> */}
                <p><strong>Project ID:</strong> {projectId}</p> {/* ---> */}
                <p><strong>Page loaded at:</strong> {new Date().toLocaleString()}</p> {/* ---> */}
            </div> {/* ---> */}
            {/* DEBUGGING END */}
        </div>
    );
}

export default page;