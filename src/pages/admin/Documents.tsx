import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Document as AppDocument } from '../../types';
import { Search, Upload, File, Download, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDocuments() {
  const { userProfile } = useAuth();
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New document form state
  const [docType, setDocType] = useState<AppDocument['documentType']>('other');
  const [accessLevel, setAccessLevel] = useState<AppDocument['accessLevel']>('company');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: AppDocument[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as AppDocument);
      });
      setDocuments(items);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile?.uid) return;

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert("File size exceeds 10MB limit.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file type (basic safety check)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/x-zip-compressed'];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload PDF, images, Word, Excel, text, or zip files.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `admin_documents/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      const newDoc: Omit<AppDocument, 'id'> = {
        ownerId: userProfile.uid,
        title: file.name,
        fileUrl: downloadURL,
        accessLevel: accessLevel,
        documentType: docType,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'documents'), newDoc);
      
      await logActivity(
        'DOCUMENT_UPLOADED',
        userProfile.uid,
        docRef.id,
        'project', // generic
        `Uploaded document: ${file.name}`
      );
      
      await fetchDocuments();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Failed to upload document", error);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (document: AppDocument) => {
    if (!window.confirm(`Are you sure you want to delete ${document.title}?`)) return;
    
    try {
      // 1. Delete from Storage
      const fileRef = ref(storage, document.fileUrl);
      try {
        await deleteObject(fileRef);
      } catch (storageError) {
        console.warn("Could not delete from storage, continuing with DB deletion.", storageError);
      }

      // 2. Delete from Firestore
      await deleteDoc(doc(db, 'documents', document.id!));
      
      setDocuments(documents.filter(d => d.id !== document.id));
      
      if (userProfile?.uid) {
        await logActivity(
          'DOCUMENT_DELETED',
          userProfile.uid,
          document.id!,
          'project',
          `Deleted document: ${document.title}`
        );
      }
    } catch (error) {
      console.error("Failed to delete document", error);
      alert("Failed to delete document");
    }
  };

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
          <p className="text-sm text-slate-500">Securely upload and manage organizational files</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Upload New Document</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-medium text-slate-700 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as any)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="project_file">Project File</option>
              <option value="requirement">Requirement</option>
              <option value="quotation">Quotation</option>
              <option value="report">Report</option>
              <option value="research">Research</option>
              <option value="technical">Technical</option>
              <option value="certificate">Certificate</option>
              <option value="resume">Resume</option>
              <option value="invoice">Invoice</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-medium text-slate-700 mb-1">Access Level</label>
            <select
              value={accessLevel}
              onChange={e => setAccessLevel(e.target.value as any)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="private">Private (Admins Only)</option>
              <option value="company">Company (Employees)</option>
              <option value="client">Client (Shared)</option>
              <option value="public">Public</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/3 flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Select File
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search documents by name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Access Level</th>
                <th className="px-6 py-4">Uploaded</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <File className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900 truncate max-w-xs block">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-700">
                      {doc.documentType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full
                        ${doc.accessLevel === 'public' ? 'bg-emerald-100 text-emerald-700' :
                          doc.accessLevel === 'client' ? 'bg-amber-100 text-amber-700' :
                          doc.accessLevel === 'private' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'}`}
                      >
                        {doc.accessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.createdAt?.toDate ? new Date(doc.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        title="Download/View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
