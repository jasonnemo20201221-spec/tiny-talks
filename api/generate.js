import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { age, groupIndex } = await request.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server API Key missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-2.5-flash";

    const questionCountInstruction = age === 5 
      ? "针对5岁儿童，每个话题设计 1 到 2 个相关联的问题，引导深度思考。" 
      : "针对3-4岁儿童，每个话题只能有 1 个简单直接的问题。";

    const prompt = `
      你是学龄前儿童教育专家。
      请为一位 ${age} 岁的孩子和他们的父母生成10个亲子聊天话题卡片。
      
      上下文信息：
      - 当前是第 ${groupIndex} 组话题（共50组）。
      - 这是一个长期的亲子互动计划，随着组数增加（${groupIndex}/50），话题应该逐渐增加一点深度、新意和想象力。
      - 请确保生成的话题与常见的简单话题不同，避免与之前的组别重复。
      
      要求：
      1. **适龄性**：${questionCountInstruction} 语言必须符合${age}岁儿童的认知水平。
      2. **性别风格交替**：请生成10个话题，其中5个偏向"男孩感兴趣的主题"（如恐龙、汽车、机械、探险），5个偏向"女孩感兴趣的主题"（如魔法、自然、小动物、艺术）。请务必**交替排列**（例如：男-女-男-女...）。
      3. **想象力与趣味**：话题要天马行空，充满童趣。
      4. **多样性**：涵盖自然、想象、情绪、生活习惯、动物等不同领域。
      5. **引导性**：给父母的建议(guidance)必须是 **2-3条递进式的逻辑引导**，简短有力。
      6. **输出格式**：必须是严格的JSON格式。
      
      请生成 JSON 对象，包含一个 'topics' 数组，每个对象包含：
      - id: 数字索引
      - title: 只有3-8个字的有趣标题
      - questions: 字符串数组。包含1-2个具体问题。
      - guidance: 字符串数组。包含2-3条简短的递进引导建议。
      - category: 话题类别 (String)
      - emoji: 一个最相关的Emoji表情
      - colorTheme: 从 'yellow', 'red', 'blue', 'green', 'purple', 'orange' 中随机选择
      - genderTheme: 标记该话题的视觉风格，只能是 'boy' 或 'girl'。如果是中性话题，请随机分配一个。
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  questions: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  guidance: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  category: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  colorTheme: { type: Type.STRING, enum: ['yellow', 'red', 'blue', 'green', 'purple', 'orange'] },
                  genderTheme: { type: Type.STRING, enum: ['boy', 'girl'] }
                },
                required: ["id", "title", "questions", "guidance", "category", "emoji", "colorTheme", "genderTheme"]
              }
            }
          }
        }
      }
    });

    let jsonText = response.text;
    if (!jsonText) {
      throw new Error("No content returned from Gemini");
    }

    // CLEANUP: Remove Markdown code blocks if present (Gemini sometimes adds them despite MIME type)
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return new Response(jsonText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}