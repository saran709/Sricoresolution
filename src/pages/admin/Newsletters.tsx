import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Image as ImageIcon, Send, Clock, Users, Plus, List } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Newsletter {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  status: 'published' | 'draft';
  createdAt: any;
}

export default function Newsletters() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // Create State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // List State
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(false);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchNewsletters();
      fetchSubscribersCount();
    }
  }, [activeTab]);

  const fetchNewsletters = async () => {
    setIsLoadingList(true);
    try {
      const q = query(collection(db, 'newsletters'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items: Newsletter[] = [];
      snap.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Newsletter);
      });
      setNewsletters(items);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchSubscribersCount = async () => {
    try {
      const snap = await getDocs(collection(db, 'newsletter_subscribers'));
      setSubscribersCount(snap.size);
    } catch (error) {
      console.error("Error fetching subscribers count:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setMessage({ text: 'Title and content are required.', type: 'error' });
      return;
    }

    setIsPublishing(true);
    setMessage({ text: '', type: '' });

    try {
      let imageUrl = '';

      if (imageFile) {
        const imageRef = ref(storage, `newsletters/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'newsletters'), {
        title,
        content,
        imageUrl,
        status: 'published',
        createdAt: serverTimestamp()
      });

      setMessage({ text: 'Newsletter published successfully!', type: 'success' });
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      
      // Clear file input
      const fileInput = document.getElementById('newsletter-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error("Error publishing newsletter:", error);
      setMessage({ text: error.message || 'Failed to publish newsletter.', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Newsletters</h1>
          <p className="text-sm text-slate-500">Create and manage your email campaigns</p>
        </div>
        
        <div className="flex p-1 bg-slate-200 rounded-lg">
          <button
            onClick={() => setActiveTab('create')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'create' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Plus className="w-4 h-4" /> Compose
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <List className="w-4 h-4" /> Archive
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Create New Newsletter</h2>
            
            {message.text && (
              <div className={cn(
                "p-4 mb-6 rounded-lg text-sm",
                message.type === 'error' ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
              )}>
                {message.text}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="e.g. Q3 Engineering Updates"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hero Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="mb-4 relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200">
                        <img loading="lazy" src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                    )}
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="newsletter-image" className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500">
                        <span>Upload a file</span>
                        <input id="newsletter-image" name="newsletter-image" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Newsletter Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-sans"
                  placeholder="Write your newsletter content here..."
                  required
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 focus:ring-4 focus:ring-amber-100 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isPublishing ? 'Publishing...' : 'Publish Newsletter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Subscribers</p>
                <p className="text-2xl font-bold text-slate-900">{subscribersCount}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Campaigns Sent</p>
                <p className="text-2xl font-bold text-slate-900">{newsletters.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-800">Past Newsletters</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {isLoadingList ? (
                <div className="p-8 text-center text-slate-500">Loading campaigns...</div>
              ) : newsletters.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No newsletters published yet.</div>
              ) : (
                newsletters.map(item => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-slate-50 transition-colors">
                    {item.imageUrl ? (
                      <div className="w-full sm:w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img loading="lazy" src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full sm:w-32 h-20 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">{item.title}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Published
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
