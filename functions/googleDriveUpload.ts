import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, file_name, folder_name } = await req.json();

    if (!file_url || !file_name) {
      return Response.json({ error: 'file_url and file_name are required' }, { status: 400 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    // Download file from Base44
    const fileResponse = await fetch(file_url);
    const fileBlob = await fileResponse.blob();

    // Create folder if specified
    let folderId = null;
    if (folder_name) {
      const folderMetadata = {
        name: folder_name,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folderResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(folderMetadata)
        }
      );

      if (folderResponse.ok) {
        const folderData = await folderResponse.json();
        folderId = folderData.id;
      }
    }

    // Upload file to Google Drive
    const metadata = {
      name: file_name,
      parents: folderId ? [folderId] : []
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileBlob);

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      return Response.json({ error: 'Failed to upload to Google Drive', details: error }, { status: uploadResponse.status });
    }

    const result = await uploadResponse.json();
    return Response.json({ 
      success: true,
      file_id: result.id,
      file_name: result.name
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});