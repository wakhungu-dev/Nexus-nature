import { createRouteHandler } from "uploadthing/next";
 
import { ourFileRouter } from "./core";
import { UTApi } from "uploadthing/server";
 
// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
 
  // Apply an (optional) custom config:
  // config: { ... },
});

export async function DELETE(request: Request) {
  try {
    const { filekey } = await request.json();
    
    if (!filekey) {
      return Response.json({ error: 'File key is required' }, { status: 400 });
    }

    const utApi = new UTApi();
    await utApi.deleteFiles(filekey);
    
    return Response.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return Response.json(
      { error: 'Failed to delete image' }, 
      { status: 500 }
    );
  }
}