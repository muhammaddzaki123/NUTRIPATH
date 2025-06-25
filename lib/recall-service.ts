import { Query } from 'react-native-appwrite';
import { formatDiseaseName } from '../utils/format';
import { config, databases } from './appwrite';
import { createChatNotification, createRecallNotification } from './notification-service';

export interface FoodInput {
  name: string;
  amount: string;
  unit: string;
  mealLabel?: string;
  mealTime?: string;
}

export interface MealData {
  carbs: FoodInput[];
  others: FoodInput[];
  snacks: FoodInput[];
  mealTime?: string | null;
}

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
  timeWarnings: string[];
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
  timeWarnings: string;
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
      const foods: string[] = [];
      if (meal.carbs.some(f => f.name)) foods.push(...meal.carbs.filter(f => f.name).map(f => `  • Karbo: ${f.name} (${f.amount} ${f.unit})`));
      if (meal.others.some(f => f.name)) foods.push(...meal.others.filter(f => f.name).map(f => `  • Lauk: ${f.name} (${f.amount} ${f.unit})`));
      if (meal.snacks.some(f => f.name)) foods.push(...meal.snacks.filter(f => f.name).map(f => `  • Selingan: ${f.name} (${f.amount} ${f.unit})`));
      return foods.length > 0 ? foods.join('\n') : "  (Tidak ada data)";
    };

    const warningSections = [];
    if (recall.timeWarnings && recall.timeWarnings.length > 0) {
        // PERBAIKAN 1: Tambahkan tipe data 'string' untuk parameter 'w'
        warningSections.push(`*Peringatan Waktu Makan:*\n${recall.timeWarnings.map((w: string) => `  - ${w}`).join('\n')}`);
    }
    if (recall.warningFoods && recall.warningFoods.length > 0) {
        // PERBAIKAN 2: Tambahkan tipe data 'FoodInput' untuk parameter 'food'
        warningSections.push(`*Asupan Melebihi Batas:*\n${recall.warningFoods.map((food: FoodInput) => `  - ${food.name} (${food.mealLabel}) sejumlah ${food.amount} ${food.unit}`).join('\n')}`);
    }

    const recallSummary = `
📋 **Hasil Food Recall Pasien**
*Nama:* ${recall.name}
*Usia:* ${recall.age} tahun
*Penyakit:* ${formatDiseaseName(recall.disease)}
---
🌅 *Makan Pagi (${recall.breakfast.mealTime || 'N/A'})*
${formatMeal(recall.breakfast)}

☀️ *Makan Siang (${recall.lunch.mealTime || 'N/A'})*
${formatMeal(recall.lunch)}

🌙 *Makan Malam (${recall.dinner.mealTime || 'N/A'})*
${formatMeal(recall.dinner)}
---
⚠️ **CATATAN PERINGATAN**
${warningSections.length > 0 ? warningSections.join('\n\n') : 'Tidak ada peringatan. Asupan pasien terpantau baik.'}
`.trim().replace(/\n\n+/g, '\n\n');

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
    console.error('Gagal membagikan food recall di chat:', error);
    throw error;
  }
};

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
      timeWarnings: response.timeWarnings ? JSON.parse(response.timeWarnings) : []
    };
  } catch (error) {
    console.error('Error getting food recall:', error);
    throw error;
  }
};

export const getUserFoodRecalls = async (userId: string) => {
  try {
    const response = await databases.listDocuments<RecallDocument>(
      config.databaseId!,
      config.foodRecallCollectionId!,
      [ Query.equal('userId', userId), Query.orderDesc('createdAt') ]
    );
    
    const recalls = response.documents.map((doc: RecallDocument) => ({
      ...doc,
      breakfast: JSON.parse(doc.breakfast),
      lunch: JSON.parse(doc.lunch),
      dinner: JSON.parse(doc.dinner),
      warningFoods: JSON.parse(doc.warningFoods),
      timeWarnings: doc.timeWarnings ? JSON.parse(doc.timeWarnings) : []
    }));

    recalls.forEach(recall => {
        if (recall.status === 'needs_update' && recall.nextReviewDate) {
            const nextReview = new Date(recall.nextReviewDate);
            if (nextReview <= new Date()) {
              createRecallNotification(
                userId,
                recall.$id,
                { name: recall.name, disease: recall.disease },
                recall.nutritionistId
              ).catch(console.error);
            }
        }
    });

    return recalls;
  } catch (error) {
    console.error('Error getting user food recalls:', error);
    throw error;
  }
};

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
