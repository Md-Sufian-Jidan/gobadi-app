// Fill these in with real credentials from Google Cloud Console (OAuth client IDs)
// and Meta for Developers (Facebook App ID). Until they're set, the Google/Facebook
// sign-in buttons show a "not configured" message instead of attempting the flow.
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
export const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '';

export const isGoogleConfigured = Boolean(GOOGLE_IOS_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID);
export const isFacebookConfigured = Boolean(FACEBOOK_APP_ID);
