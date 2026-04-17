import defaultLogoImg from "../../assets/iqrat-logo.png";

export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Helper to format backend image paths to real URLs
export const formatImageUrl = (path) => {
    if (!path) return defaultLogoImg;
    
    // If it's a Cloudinary URL (or any external URL), return it as-is
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob")) {
        return path;
    }
    
    // Fallback for old local files (cleans up backslashes and accidental leading slashes)
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
};