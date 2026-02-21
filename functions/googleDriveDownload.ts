import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_id, file_name } = await req.json();

    if (!file_id) {
      return Response.json({ error: 'file_id is required' }, { status: 400 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    // Download file from Google Drive
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file_id}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Failed to download file', details: error }, { status: response.status });
    }

    // Get the file as a blob
    const blob = await response.blob();
    
    // Upload to Base44 storage
    const formData = new FormData();
    formData.append('file', blob, file_name);

    const uploadResult = await base44.integrations.Core.UploadFile({ file: blob });

    return Response.json({ 
      file_url: uploadResult.file_url,
      file_name: file_name
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});