import { GoogleGenerativeAI } from "@google/generative-ai";

// APIキーは後で設定画面から入力するようにします
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const generateArticle = async (config: any) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `${config.topic}について、キーワード「${config.keywords}」を含めて記事を書いてください。`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return {
    title: `${config.topic}に関する記事`,
    content: response.text()
  };
};
