import { Models, Query } from 'react-native-appwrite';
import { config, databases } from './appwrite';

export interface FoodInput {
  name: string;
  amount: string;
  unit: string;
}

export interface MealData {
  carbs: FoodInput;
  others: FoodInput[];
  snacks: FoodInput[];
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
}

interface RecallDocument extends Models.Document {
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
  sharedInChat?: boolean;
  nutritionistId?: string;
}

// Save food recall data to database
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
      createdAt: new Date().toISOString()
    };

    const response = await databases.createDocument(
      config.databaseId!,
      config.foodRecallCollectionId!,
      'unique()',
      documentData
    );

    console.log('Food recall data saved successfully:', response);
    return response;
  } catch (error) {
    console.error('Error saving food recall data:', error);
    throw error;
  }
};

// Get food recall history for a user
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
    
    // Parse stringified data
    return response.documents.map(doc => ({
      ...doc,
      breakfast: JSON.parse(doc.breakfast),
      lunch: JSON.parse(doc.lunch),
      dinner: JSON.parse(doc.dinner),
      warningFoods: JSON.parse(doc.warningFoods)
    }));
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

// Share food recall data in chat
export const shareFoodRecallInChat = async (
  recallId: string,
  chatId: string,
  userId: string,
  nutritionistId: string
) => {
  try {
    // Get the food recall data
    const recall = await getFoodRecallById(recallId);
    
    // Format the recall data as a message
    const recallSummary = `
Food Recall Data:
Nama: ${recall.name}
Usia: ${recall.age}
Jenis Kelamin: ${recall.gender}
Riwayat Penyakit: ${recall.disease}

Makanan yang Melebihi Batas:
${recall.warningFoods.map((food: FoodInput) => 
  `- ${food.name}: ${food.amount} ${food.unit}`
).join('\n')}
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

    return message;
  } catch (error) {
    console.error('Error sharing food recall in chat:', error);
    throw error;
  }
};
