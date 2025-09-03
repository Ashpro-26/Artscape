# Artwork Upload Testing Guide

## **Backend Status**
- ✅ Artwork model created
- ✅ Upload routes implemented
- ✅ Authentication middleware working
- ✅ Server running on port 5000

## **Frontend Status**
- ✅ Upload form component created
- ✅ Gallery with upload button
- ✅ Navigation between pages
- ✅ Form validation and error handling

## **Test the Upload Feature**

### **1. Test Upload via Frontend**
1. **Login** to your account
2. **Go to Gallery** (`/gallery`)
3. **Click "Upload Artwork"** button
4. **Fill out the form** with sample data:
   - Title: "My First Digital Art"
   - Description: "A beautiful digital artwork created with love"
   - Image URL: `https://via.placeholder.com/400x300/667eea/ffffff?text=Sample+Artwork`
   - Category: "Digital Art"
   - Tags: "digital, art, sample"
5. **Click "Upload Artwork"**
6. **Verify** you're redirected to gallery and see your artwork

### **2. Test Upload via API (Optional)**
```bash
curl -X POST http://localhost:5000/api/artwork \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Sample Artwork",
    "description": "A test artwork for the gallery",
    "imageUrl": "https://via.placeholder.com/400x300/764ba2/ffffff?text=Test+Art",
    "category": "Digital Art",
    "tags": ["test", "sample", "art"]
  }'
```

### **3. Test Gallery Features**
- ✅ **Browse artworks** in grid layout
- ✅ **Search** by title/description
- ✅ **Filter** by category
- ✅ **Like** artworks (requires login)
- ✅ **Pagination** (if many artworks)
- ✅ **Responsive design**

## **Sample Artwork Data**
Use these placeholder images for testing:
- `https://via.placeholder.com/400x300/667eea/ffffff?text=Digital+Art`
- `https://via.placeholder.com/400x300/764ba2/ffffff?text=Traditional+Art`
- `https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Photography`
- `https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Sculpture`

## **Expected Results**
- Upload form should validate required fields
- Successful upload should redirect to gallery
- Artwork should appear in gallery with correct details
- Like functionality should work for logged-in users
- Search and filter should work properly 