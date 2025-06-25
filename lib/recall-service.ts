import { Query } from 'react-native-appwrite';
import { config, databases } from './appwrite';
import { createChatNotification, createRecallNotification } from './notification-service';

export interface FoodInput {
  name: string;
  amount: string;
  unit: string;
}

export interface MealData {
  carbs: FoodInput[];
  others: FoodInput[];
  snacks: FoodInput[];
  mealTime?: string | null;
  snackTime?: string | null;
}

// --- PERUBAHAN 1: Pastikan timeWarnings ada di tipe data ---
export interface RecallData {
  userId: string;
  name: string;
  age: string;
  gender: string;
  disease: string;
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  warningFoods: FoodInput[];
  timeWarnings?: string[]; // Jadikan opsional untuk keamanan
  createdAt?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  nutritionistId?: string;
  status: 'pending' | 'reviewed' | 'needs_update';
}

interface RecallDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
  userId: string;
  name: string;
  age: string;
  gender: string;
  disease: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  warningFoods: string;
  timeWarnings?: string; // Stored as a JSON string
  createdAt: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  nutritionistId?: string;
  status: 'pending' | 'reviewed' | 'needs_update';
  sharedInChat?: boolean;
}

export const saveFoodRecall = async (data: Omit<RecallData, 'createdAt'>) => {
  try {
    const documentData = {
      ...data,
      breakfast: JSON.stringify(data.breakfast),
      lunch: JSON.stringify(data.lunch),
      dinner: JSON.stringify(data.dinner),
      warningFoods: JSON.stringify(data.warningFoods),
      // --- PERUBAHAN 2: Pastikan timeWarnings ada sebelum di-stringify ---
      timeWarnings: JSON.stringify(data.timeWarnings || []),
      createdAt: new Date().toISOString(),
      status: 'pending' as const
    };

    const response = await databases.createDocument(
      config.databaseId!,
      config.foodRecallCollectionId!,
      'unique()',
      documentData
    );

    // Notifikasi tetap sama
    await createRecallNotification(
      data.userId,
      response.$id,
      { name: data.name, disease: data.disease }
    );
    if (data.nutritionistId) {
      await createRecallNotification(
        data.userId,
        response.$id,
        { name: data.name, disease: data.disease },
        data.nutritionistId
      );
    }
    return response;
  } catch (error) {
    console.error('Error saving food recall data:', error);
    throw error;
  }
};

export const shareFoodRecallInChat = async (
  recallId: string,
  chatId: string,
  userId: string,
  nutritionistId: string,
  userName: string
) => {
  try {
    const recall = await getFoodRecallById(recallId);
    
    const formatMeal = (meal: MealData) => {
      const parts: string[] = [];
      const mainFoods = [
        ...meal.carbs.filter(f => f.name).map(f => `  🍚 Karbohidrat: ${f.name} (${f.amount} ${f.unit})`),
        ...meal.others.filter(f => f.name).map(f => `  🍖 Lauk: ${f.name} (${f.amount} ${f.unit})`),
      ];
      if (mainFoods.length > 0) {
        if (meal.mealTime) parts.push(`⏰ Waktu Makan Utama: ${meal.mealTime}`);
        parts.push(...mainFoods);
      }
      const snackFoods = meal.snacks.filter(f => f.name).map(f => `  🍎 Selingan: ${f.name} (${f.amount} ${f.unit})`);
      if (snackFoods.length > 0) {
        if (parts.length > 0) parts.push('');
        if (meal.snackTime) parts.push(`🕒 Waktu Selingan: ${meal.snackTime}`);
        parts.push(...snackFoods);
      }
      return parts.join('\n');
    };

    // --- PERUBAHAN 3: Format pesan chat untuk menyertakan timeWarnings ---
    const recallSummary = `
📋 Food Recall Data:
👤 Nama: ${recall.name}
📅 Usia: ${recall.age}
⚧ Jenis Kelamin: ${recall.gender}
🏥 Riwayat Penyakit: ${recall.disease}

🌅 === MAKAN PAGI ===
${formatMeal(recall.breakfast)}

☀️ === MAKAN SIANG ===
${formatMeal(recall.lunch)}

🌙 === MAKAN MALAM ===
${formatMeal(recall.dinner)}

${recall.warningFoods.length > 0 ? `\n⚠️ PERINGATAN - Makanan Melebihi Batas:
${recall.warningFoods.map((food: FoodInput) => 
  `❗ ${food.name}: ${food.amount} ${food.unit}`
).join('\n')}` : ''}

${(recall.timeWarnings && recall.timeWarnings.length > 0) ? `\n\n🕒 PERINGATAN - Waktu Makan Tidak Sesuai:
${recall.timeWarnings.map((warning: string) => 
  `- ${warning}`
).join('\n')}` : ''}
    `.trim();

    const message = await databases.createDocument(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      'unique()',
      {
        chatId,
        userId,
        nutritionistId,
        text: recallSummary,
        sender: 'user',
        time: new Date().toISOString(),
        read: false,
        isRecallData: true,
        recallId
      }
    );

    // Sisa fungsi notifikasi tidak perlu diubah
    await createChatNotification(
      userId,
      nutritionistId,
      userName,
      'Food Recall Data dibagikan untuk direview',
      chatId,
      true,
      true
    );
    await databases.updateDocument(
      config.databaseId!,
      config.foodRecallCollectionId!,
      recallId,
      { sharedInChat: true, nutritionistId, status: 'pending', lastReviewDate: null, nextReviewDate: null }
    );
    await createRecallNotification(
      userId,
      recallId,
      { name: recall.name, disease: recall.disease },
      nutritionistId
    );
    return message;
  } catch (error) {
    console.error('Error sharing food recall in chat:', error);
    throw error;
  }
};

// --- PERUBAHAN 4: Pastikan parse timeWarnings di fungsi get ---
export const getFoodRecallById = async (recallId: string) => {
  try {
    const response = await databases.getDocument<RecallDocument>(
      config.databaseId!,
      config.foodRecallCollectionId!,
      recallId
    );
    
    return {
      ...response,
      breakfast: JSON.parse(response.breakfast),
      lunch: JSON.parse(response.lunch),
      dinner: JSON.parse(response.dinner),
      warningFoods: JSON.parse(response.warningFoods),
      // Tambahkan parse untuk timeWarnings
      timeWarnings: response.timeWarnings ? JSON.parse(response.timeWarnings) : []
    };
  } catch (error) {
    console.error('Error getting food recall:', error);
    throw error;
  }
};

// --- PERUBAHAN 5: Pastikan parse timeWarnings di fungsi get list ---
export const getUserFoodRecalls = async (userId: string) => {
  try {
    const response = await databases.listDocuments<RecallDocument>(
      config.databaseId!,
      config.foodRecallCollectionId!,
      [ Query.equal('userId', userId), Query.orderDesc('createdAt') ]
    );
    
    return response.documents.map((doc: RecallDocument) => ({
      ...doc,
      breakfast: JSON.parse(doc.breakfast),
      lunch: JSON.parse(doc.lunch),
      dinner: JSON.parse(doc.dinner),
      warningFoods: JSON.parse(doc.warningFoods),
      timeWarnings: doc.timeWarnings ? JSON.parse(doc.timeWarnings) : []
    }));
  } catch (error) {
    console.error('Error getting user food recalls:', error);
    throw error;
  }
};

// Fungsi updateRecallStatus tidak perlu diubah
export const updateRecallStatus = async (
  recallId: string,
  status: 'reviewed' | 'needs_update',
  nutritionistId: string,
  nextReviewDate?: string
) => {
  try {
    const recall = await getFoodRecallById(recallId);
    
    await databases.updateDocument(
      config.databaseId!,
      config.foodRecallCollectionId!,
      recallId,
      {
        status,
        lastReviewDate: new Date().toISOString(),
        nextReviewDate: nextReviewDate || null
      }
    );

    await createRecallNotification(
      recall.userId,
      recallId,
      {
        name: recall.name,
        disease: recall.disease
      },
      nutritionistId
    );

    return true;
  } catch (error) {
    console.error('Error updating recall status:', error);
    throw error;
  }
};
