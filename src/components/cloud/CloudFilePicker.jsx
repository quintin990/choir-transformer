import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Cloud, File, Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CloudFilePicker({ open, onClose, onSelect, provider = 'google_drive' }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open]);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (provider === 'google_drive') {
        response = await base44.functions.invoke('googleDriveList');
      }
      setFiles(response.data.files || []);
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async (file) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (provider === 'google_drive') {
        response = await base44.functions.invoke('googleDriveDownload', {
          file_id: file.id,
          file_name: file.name
        });
      }
      onSelect({
        file_url: response.data.file_url,
        file_name: response.data.file_name,
        source: provider
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Select File from {provider === 'google_drive' ? 'Google Drive' : provider}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && !files.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    disabled={loading}
                    className="w-full p-4 text-left border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-start gap-3">
                      <File className="w-5 h-5 mt-0.5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredFiles.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    No audio files found
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}