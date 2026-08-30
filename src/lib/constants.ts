// ============================================================
// EDITABLE SITE SETTINGS
// ============================================================
// This is the MAIN file you edit to customize your website.
// Change the text here and it updates across the whole site.
// ============================================================

// --- WEBSITE NAME ---
// This appears in the logo, browser tab title, and navigation.
export const SITE_NAME = "MitsuCafe";

// --- LOGO ICON ---
// This is the icon shown next to your website name.
// You can use any icon from lucide-react. To change it:
//   1. Go to https://lucide.dev to browse icons
//   2. Find one you like and copy its name (e.g. "Coffee", "Cat", "Star")
//   3. Change the LOGO_ICON_NAME below to that name (same capitalization)
//   4. Also update the import in the Navbar.tsx file
export const LOGO_ICON_NAME = "Cat";

// --- NAVIGATION LINKS ---
// These are the links shown in the navigation bar.
// To add/remove/rename links, edit this array.
// Each link has a "label" (the text shown) and a "page" (which page it opens).
export const NAV_LINKS = [
  { label: "Home", page: "home" },
  { label: "Downloader", page: "downloader" },
  { label: "Blog", page: "blog" },
  { label: "About", page: "about" },
];

// --- HOME PAGE MENU CARDS ---
// These are the cards shown on the home page in a 2-top, 1-bottom layout.
// To change a card's title, description, or which page it opens, edit below.
// To add more cards, add more objects to this array (but 3 looks best for the layout).
export const HOME_CARDS = [
  {
    title: "Downloader",
    description: "Download media from YouTube, TikTok, Instagram, and more.",
    page: "downloader",
    icon: "Download",
  },
  {
    title: "Blog",
    description: "Read the latest posts and updates from MitsuCafe.",
    page: "blog",
    icon: "FileText",
  },
  {
    title: "About",
    description: "Learn more about this project and who made it.",
    page: "about",
    icon: "Info",
  },
];

// --- ABOUT PAGE CONTENT ---
// This text appears on the About page. Edit it to tell people about yourself.
export const ABOUT_CONTENT = {
  // The big heading at the top:
  heading: "About MitsuCafe",
  // The paragraph below the heading:
  body: "MitsuCafe is a personal website project. It features a media downloader, a blog, a global chat, and user accounts with roles and badges. This whole site is editable — every text you see can be changed in the code. Feel free to make it yours!",
  // A list of features (each item shows as a bullet point):
  features: [
    "Media downloader powered by Cobalt",
    "Blog with editable posts",
    "Global chat with roles and badges",
    "User accounts with sign up / sign in",
    "Moderation system (ban, roles, badges)",
  ],
  // Your name or alias (shown at the bottom):
  author: "Mitsu",
};

// --- BLOG POSTS (DEFAULT) ---
// These are the default blog posts shown if the database has no posts.
// You can also add/edit posts from the Blog page itself (if you're signed in).
// To add a new post here, copy one of the objects below and change the text.
export const DEFAULT_BLOG_POSTS = [
  {
    title: "Welcome to MitsuCafe",
    excerpt: "The first post on our new home.",
    content:
      "Welcome to MitsuCafe! This is where we share updates, news, and thoughts. You can edit this post or add your own — everything is customizable in the code. Just open the blog page, sign in, and click the edit button on any post.",
    author: "MitsuCafe",
  },
  {
    title: "How to Use the Downloader",
    excerpt: "A quick guide to saving media.",
    content:
      "Paste a link from YouTube, TikTok, Instagram, or other supported sites into the downloader page, then hit Download. The downloader fetches the media and gives you a direct link to save it to your device.",
    author: "MitsuCafe",
  },
];

// --- CHAT SETTINGS ---
export const CHAT_SETTINGS = {
  // How many messages to load at once:
  messageLimit: 50,
  // Max message length:
  maxLength: 500,
};

// --- ROLE COLORS ---
// These control the color of role labels shown next to usernames.
// You can change the color name to any Tailwind color (e.g. "red", "blue", "green").
export const ROLE_COLORS: Record<string, string> = {
  admin: "red",
  developer: "blue",
  member: "gray",
};

// --- BADGE COLOR MAP ---
// Maps badge_color values to Tailwind classes.
// If you add a new color, add it here too.
export const BADGE_COLORS: Record<string, string> = {
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  red: "bg-red-500/20 text-red-300 border-red-500/40",
  green: "bg-green-500/20 text-green-300 border-green-500/40",
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  pink: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  gray: "bg-gray-500/20 text-gray-300 border-gray-500/40",
};
