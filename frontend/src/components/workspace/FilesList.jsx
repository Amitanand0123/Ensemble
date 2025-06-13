import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWorkspaceFiles,
    fetchProjectFiles,
    uploadWorkspaceFiles,
    uploadProjectFiles,
    deleteFile,
    clearFiles,
    getFileSummary,
    clearSummary
} from '../../redux/slices/fileSlice.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, UploadCloud, Trash2, Download, Loader2, AlertCircle,Sparkles,X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import PropTypes from 'prop-types';


const FilesList = ({ contextType, contextId }) => {
    const dispatch = useDispatch();
    const { files = [], isLoading, error } = useSelector((state) => state.files);
    const summaries=useSelector((state)=> state.files.summaries)
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        dispatch(clearFiles());

        if (contextId) {
            if (contextType === 'workspace') {
                dispatch(fetchWorkspaceFiles(contextId));
            } else if (contextType === 'project') {
                dispatch(fetchProjectFiles(contextId));
            }
        }
        return () => {
            dispatch(clearFiles());
        };
    }, [dispatch, contextType, contextId]);

    const handleFileSelect = (event) => {
        setSelectedFiles(Array.from(event.target.files || []));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select files to upload.");
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            const fieldName = contextType === 'workspace' ? 'workspaceFiles' : 'projectFiles';
            formData.append(fieldName, file);
        });

        setIsUploading(true);
        try {
            if (contextType === 'workspace') {
                await dispatch(uploadWorkspaceFiles({ workspaceId: contextId, formData })).unwrap();
            } else if (contextType === 'project') {
                 await dispatch(uploadProjectFiles({ projectId: contextId, formData })).unwrap();
            }
            toast.success("File(s) uploaded successfully!");
            setSelectedFiles([]);
            if(fileInputRef.current) fileInputRef.current.value = null;
        } catch (uploadError) {
            console.error("Upload failed:", uploadError);
            toast.error(`Upload failed: ${uploadError || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
         try {
            await dispatch(deleteFile(fileId)).unwrap();
            toast.success("File deleted successfully!");
        } catch (deleteError) {
             console.error("Delete failed:", deleteError);
            toast.error(`Delete failed: ${deleteError || 'Unknown error'}`);
        }
    };


    const handleSummarize=(fileId)=>{
        if(!summaries[fileId]?.isLoading && !summaries[fileId]?.summary && !summaries[fileId]?.error){
            dispatch(getFileSummary(fileId))
        }
    }

    const handleClearSummary=(fileId)=>{
        dispatch(clearSummary(fileId))
    }

    return (
        <Card className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white animate-fade-in-up mt-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Files</CardTitle>
                <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Files
                </Button>
            </CardHeader>
            <CardContent>
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                />
                {selectedFiles.length > 0 && (
                    <div className="my-4 p-3 border border-dashed border-gray-600 rounded-lg bg-gray-700/50">
                        <h4 className="text-sm font-semibold mb-2 text-gray-300">Ready to upload:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                            {selectedFiles.map((file, index) => (
                                <li key={index} className="text-xs text-gray-400">{file.name}</li>
                            ))}
                        </ul>
                        <Button
                            size="sm"
                            className="mt-3 w-full"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
                        </Button>
                    </div>
                )}
                {isLoading && !isUploading && (
                    <div className="text-center py-6 text-gray-400">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        Loading files...
                    </div>
                )}
                {error && (
                    <div className="text-center py-6 text-red-400 flex items-center justify-center">
                        <AlertCircle className="mr-2 h-5 w-5" /> Error: {error}
                    </div>
                )}

                {!isLoading && !error && files.length === 0 && (
                     <div className="text-center py-10 text-gray-500">
                        <FileText className="mx-auto h-10 w-10 mb-3" />
                        No files uploaded to this {contextType} yet.
                     </div>
                )}

                {!isLoading && !error && files.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {files.map((file) => {
                            const fileSummaryData = summaries[file._id];
                            const isSummarizing = fileSummaryData?.isLoading;
                            const summaryText = fileSummaryData?.summary;
                            const summaryError = fileSummaryData?.error;
                            const canSummarize = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype);

                            return (
                                <div key={file._id} className="p-3 bg-gray-700/60 rounded-md transition-colors border border-transparent hover:border-gray-600">
                                    <div className="flex items-center justify-between">
                                         <div className="flex items-center space-x-3 overflow-hidden">
                                            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            <div className="overflow-hidden">
                                                <a href={file.url} /* ... */ >{file.filename}</a>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                </p>
                                            </div>
                                        </div>
                                        {/* Action Buttons */}
                                        <div className="flex items-center space-x-1 flex-shrink-0">
                                            {/* Summarize Button */}
                                            {canSummarize && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleSummarize(file._id)}
                                                    disabled={isSummarizing || !!summaryText || !!summaryError} // Disable if loading, has summary, or has error
                                                    className="text-purple-400 hover:text-purple-300 h-7 w-7"
                                                    aria-label="Summarize file"
                                                    title={summaryText ? "Summary generated" : summaryError ? `Error: ${summaryError}`: "Summarize file"}
                                                >
                                                    {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            {/* ... (Download and Delete buttons remain the same) ... */}
                                             <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-white h-7 w-7">
                                                 <a href={file.url} /* ... */><Download className="h-4 w-4" /></a>
                                             </Button>
                                             <AlertDialog>
                                                 <AlertDialogTrigger asChild><Button variant="ghost" /* ... */><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                 <AlertDialogContent /* ... */>
                                                     {/* ... confirmation ... */}
                                                     <AlertDialogAction onClick={() => handleDelete(file._id)} /* ... */>Yes, delete</AlertDialogAction>
                                                 </AlertDialogContent>
                                             </AlertDialog>
                                        </div>
                                    </div>

                                    {/* Summary Display Area */}
                                    {(isSummarizing || summaryText || summaryError) && (
                                        <div className="mt-2 pt-2 border-t border-gray-600/50 text-xs pl-8 relative"> {/* Indent summary */}
                                             {/* Clear Summary Button */}
                                             {(summaryText || summaryError) && !isSummarizing && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleClearSummary(file._id)}
                                                    className="absolute top-1 right-0 text-gray-500 hover:text-gray-300 h-5 w-5 p-0"
                                                    aria-label="Clear summary"
                                                    title="Clear summary"
                                                >
                                                    <X className="h-3 w-3"/>
                                                </Button>
                                             )}
                                            {isSummarizing && <p className="text-gray-400 italic animate-pulse">Generating summary...</p>}
                                            {summaryError && <p className="text-red-400">Summarization Error: {summaryError}</p>}
                                            {summaryText && <p className="text-gray-300 whitespace-pre-wrap">{summaryText}</p>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

FilesList.propTypes={
    contextType:PropTypes.string,
    contextId:PropTypes.string
}

export default FilesList;