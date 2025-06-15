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
  createdAt: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  nutritionistId?: string;
  status: 'pending' | 'reviewed' | 'needs_update';
  sharedInChat?: boolean;
}

// Save food recall data to database with enhanced notification
export const saveFoodRecall = async (data: Omit<RecallData, 'createdAt'>) => {
  try {
    console.log('Saving food recall data:', data);
    
    // Stringify objects before saving
    const documentData = {
      ...data,
      breakfast: JSON.stringify(data.breakfast),
      lunch: JSON.stringify(data.lunch),
      dinner: JSON.stringify(data.dinner),
      warningFoods: JSON.stringify(data.warningFoods),
      createdAt: new Date().toISOString(),
      status: 'pending' as const
    };

    const response = await databases.createDocument(
      config.databaseId!,
      config.foodRecallCollectionId!,
      'unique()',
      documentData
    );

    // Create notification for the user
    await createRecallNotification(
      data.userId,
      response.$id,
      {
        name: data.name,
        disease: data.disease
      }
    );

    // If user has a nutritionist assigned, notify them as well
    if (data.nutritionistId) {
      await createRecallNotification(
        data.userId,
        response.$id,
        {
          name: data.name,
          disease: data.disease
        },
        data.nutritionistId
      );
    }

    console.log('Food recall data saved successfully:', response);
    return response;
  } catch (error) {
    console.error('Error saving food recall data:', error);
    throw error;
  }
};

// Share food recall data in chat with enhanced notifications
export const shareFoodRecallInChat = async (
  recallId: string,
  chatId: string,
  userId: string,
  nutritionistId: string,
  userName: string
) => {
  try {
    // Get the food recall data
    const recall = await getFoodRecallById(recallId);
    
    // Format the recall data as a message
const formatMeal = (meal: MealData) => {
      const foods = [];
      
      // Add meal time if available
      if (meal.mealTime) {
        foods.push(`⏰ Waktu: ${meal.mealTime}`);
      }

      // Add carbs
      // Process each type of food
      const carbFoods = meal.carbs.filter(f => f.name).map(f =>
        `🍚 Karbohidrat: ${f.name} (${f.amount} ${f.unit})`
      );
      
      const otherFoods = meal.others.filter(f => f.name).map(f => 
        `🍖 Lauk: ${f.name} (${f.amount} ${f.unit})`
      );

      const snackFoods = meal.snacks.filter(f => f.name).map(f => 
        `🍎 Selingan: ${f.name} (${f.amount} ${f.unit})`
      );
      
      return [
        ...foods,
        ...carbFoods,
        ...otherFoods,
        ...snackFoods
      ].join('\n');
    };

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

${recall.warningFoods.length ? `\n⚠️ PERINGATAN - Makanan yang Melebihi Batas:
${recall.warningFoods.map((food: FoodInput) => 
  `❗ ${food.name}: ${food.amount} ${food.unit}`
).join('\n')}` : ''}
    `.trim();

    // Send the message to chat
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

    // Create notification for nutritionist about shared recall
    await createChatNotification(
      userId,
      nutritionistId,
      userName,
      'Food Recall Data dibagikan untuk direview',
      chatId,
      true,
      true
    );

    // Update recall document status
    await databases.updateDocument(
      config.databaseId!,
      config.foodRecallCollectionId!,
      recallId,
      {
        sharedInChat: true,
        nutritionistId,
        status: 'pending',
        lastReviewDate: null,
        nextReviewDate: null
      }
    );

    // Create recall notification for both user and nutritionist
    await createRecallNotification(
      userId,
      recallId,
      {
        name: recall.name,
        disease: recall.disease
      },
      nutritionistId
    );

    return message;
  } catch (error) {
    console.error('Error sharing food recall in chat:', error);
    throw error;
  }
};

// Get food recall history for a user with notification status
export const getUserFoodRecalls = async (userId: string) => {
  try {
    const response = await databases.listDocuments<RecallDocument>(
      config.databaseId!,
      config.foodRecallCollectionId!,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt')
      ]
    );
    
    // Parse stringified data and check for recalls needing review
    const recalls = response.documents.map((doc: RecallDocument) => {
      const recall = {
        ...doc,
        breakfast: JSON.parse(doc.breakfast),
        lunch: JSON.parse(doc.lunch),
        dinner: JSON.parse(doc.dinner),
        warningFoods: JSON.parse(doc.warningFoods)
      };

      // If recall needs review and hasn't been notified recently
      if (doc.status === 'needs_update' && doc.nextReviewDate) {
        const nextReview = new Date(doc.nextReviewDate);
        if (nextReview <= new Date()) {
          // Create notification for review reminder
          createRecallNotification(
            userId,
            doc.$id,
            {
              name: doc.name,
              disease: doc.disease
            },
            doc.nutritionistId
          ).catch(console.error);
        }
      }

      return recall;
    });

    return recalls;
  } catch (error) {
    console.error('Error getting user food recalls:', error);
    throw error;
  }
};

// Get specific food recall by ID
export const getFoodRecallById = async (recallId: string) => {
  try {
    const response = await databases.getDocument<RecallDocument>(
      config.databaseId!,
      config.foodRecallCollectionId!,
      recallId
    );
    
    // Parse stringified data
    return {
      ...response,
      breakfast: JSON.parse(response.breakfast),
      lunch: JSON.parse(response.lunch),
      dinner: JSON.parse(response.dinner),
      warningFoods: JSON.parse(response.warningFoods)
    };
  } catch (error) {
    console.error('Error getting food recall:', error);
    throw error;
  }
};

// Update recall status with notifications
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

    // Create notification for the user about the review
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
