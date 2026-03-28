const STORAGE_KEY = "swarg_ai_chats";

export const getChats = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveChats = (chats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const createNewChat = (title = "New Chat") => ({
  id: crypto.randomUUID(),
  title,
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const generateTitle = (firstMessage) => {
  const words = firstMessage.trim().split(" ").slice(0, 5).join(" ");
  return words.length > 30 ? words.slice(0, 30) + "..." : words;
};
