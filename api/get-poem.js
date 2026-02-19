// api/get-poem.js - Vercel Serverless Function for generating poems
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body || {};

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2-7B-Instruct',
        messages: [
          {
            role: 'system',
            content: '你是一个严格遵守格式的古诗生成器。只输出以下纯 JSON 结构，不要加任何多余文字、解释、markdown 或代码块：{"name": "诗的标题（4-8个汉字）", "lines": ["完整的第一行", "完整的第二行", "完整的第三行", "完整的第四行"]}'
          },
          {
            role: 'user',
            content: prompt || '请随机生成一首五言或七言绝句，主题关于四季、自然或人生感悟。'
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SiliconFlow API 请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // 清理可能的 markdown 包裹（有些模型会加 ```json）
    content = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    const poem = JSON.parse(content);

    res.status(200).json(poem);
  } catch (error) {
    console.error('生成诗出错:', error);
    res.status(500).json({ error: '无法生成古诗：' + error.message });
  }
}
