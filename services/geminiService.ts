
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { StoryContent } from '../types';

const getApiKey = (): string => {
  const apiKey = (window as any).GEMINI_API_KEY;
  if (!apiKey || apiKey === "MISSING_API_KEY" || apiKey === "__API_KEY__") {
    const errorMsg = "Gemini API Key is not configured. Please add it to your Hugging Face Space secrets under the name 'API_KEY'.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return apiKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-3.0-generate-002';

const storySchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A highly technical and specific title for the analysis report, suitable for a developer audience."
    },
    tableOfContents: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A bulleted list of 3-5 key technical sections, like 'Algorithm Breakdown', 'Pseudocode Implementation', 'Performance Considerations'."
    },
    story: {
      type: Type.STRING,
      description: "A deep technical analysis of the topic for developers. It must include algorithmic explanations, discussions of data structures, and pseudocode examples in Python or a similar format. The tone must be professional, authoritative, and educational."
    },
    nextTopics: {
      type: Type.ARRAY,
      description: "A list of 5 unique, specific, and advanced technical topics that logically follow from the main analysis. These will be presented to the user as the next choices for research.",
      items: { type: Type.STRING }
    }
  },
  required: ['title', 'tableOfContents', 'story', 'nextTopics']
};

export const generateStoryContent = async (topic: string, history: StoryContent[]): Promise<Omit<StoryContent, 'imageUrl'>> => {
  try {
    const previouslyCoveredTopics = history.map(item => item.topic).join(', ') || 'None';

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: `My previous areas of research were: ${previouslyCoveredTopics}. My next area of focus is: "${topic}". Please provide a deep technical analysis and also suggest the next set of research topics.`,
      config: {
        systemInstruction: "You are a 'Principal Quantum Software Architect' AI. Your audience is experienced software developers and researchers. Your purpose is to provide deep technical analysis of quantum computing concepts applied to finance. Focus on algorithms, data structures, potential implementation challenges, and provide clear pseudocode or code snippets (in Python/Qiskit where appropriate). You must ALSO provide a list of 5 logical follow-up topics for further research. The entire output must strictly follow the provided JSON schema.",
        responseMimeType: "application/json",
        responseSchema: storySchema,
        temperature: 0.4,
      }
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (!parsed.title || !parsed.story || !parsed.tableOfContents || !parsed.nextTopics) {
        throw new Error("AI response is missing required fields like 'title', 'story', 'tableOfContents', or 'nextTopics'.");
    }

    return { 
        title: parsed.title, 
        story: parsed.story, 
        tableOfContents: parsed.tableOfContents, 
        nextTopics: parsed.nextTopics,
        topic 
    };

  } catch (error) {
    console.error("Error generating story content:", error);
    throw new Error(`Failed to generate analysis from AI. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateStoryImage = async (storyText: string): Promise<string> => {
  try {
    const storyExcerpt = storyText.substring(0, 200);
    const prompt = `Create a clean, technical diagram or abstract visualization for a presentation slide about a quantum computing algorithm. The concept is related to: '${storyExcerpt}'. Use a blueprint-style aesthetic with blues, whites, and light grays. Feature elements like qubit representations, circuit diagrams, or abstract data flow graphs. The style should be informative and technical, suitable for a developer conference. Avoid corporate art.`;

    const response = await ai.models.generateImages({
        model: imageModel,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("AI did not return any images.");
    }
    
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return base64ImageBytes;

  } catch (error) {
    console.error("Error generating story image:", error);
    throw new Error(`Failed to generate image from AI. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};
