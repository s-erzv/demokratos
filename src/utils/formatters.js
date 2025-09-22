// src/utils/formatters.js

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale'; // Import locale Bahasa Indonesia

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) {
    return "beberapa saat yang lalu";
  }
  // Timestamp dari Firestore perlu diubah ke objek Date JavaScript
  const date = timestamp.toDate(); 
  
  return formatDistanceToNow(date, { addSuffix: true, locale: id });
};