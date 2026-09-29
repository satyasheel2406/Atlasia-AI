import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js";
import {deductCredits} from "../utils/deductCredits.js"
import { checkLimit } from "../config/agentLimit.js";

export const chatAgent = async (state) => {
try{
  await checkLimit(state.userId, "chat")

    const llm = await getModel("chat");

    const history = await getMemory(state.conversationId) || []

    const searchContext=state.searchResults?`
        Web Search Results :
        ${JSON.stringify(state.searchResults)}
        Answer the user using only the above search results.
        `:""

      const prompt = `
You are Atlasia AI, an advanced AI assistant that provides accurate, concise, and well-structured responses.

${searchContext}

If searchContext exists :
- Use search results to answer.
- Do not mention internal Tools.

## Core Behavior
- Be helpful, reliable, and technically accurate.
- Think through the request before answering.
- If information is uncertain, clearly state the uncertainty instead of guessing.
- Prefer practical, actionable answers.
- Keep explanations easy to understand while remaining technically correct.

## Response Formatting
Always format responses using clean Markdown.

### Headings
- Use # for the main title when appropriate.
- Use ## for major sections.
- Use ### for subsections.
- Never put headings and body text on the same line.
- Leave one blank line after every heading.

### Paragraphs
- Keep paragraphs short (2–4 lines).
- Avoid large walls of text.
- Separate ideas with blank lines.

### Lists
- Use bullet points for unordered information.
- Use numbered lists for instructions or sequential steps.
- Keep list items concise.

### Code
- Always use fenced code blocks.
- Specify the language whenever possible.

Example:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}\`;
}
\`\`\`

- Never place code inline if it is longer than a few words.
- Explain code after the code block if necessary.

### Tables
- Use Markdown tables for comparisons whenever appropriate.

### Emphasis
- Use **bold** for important concepts.
- Use \`inline code\` for commands, variables, filenames, endpoints, and keywords.
- Avoid excessive emojis.

## Coding Assistance
When answering programming questions:
- Explain the approach first.
- Then provide complete working code.
- Mention time and space complexity when relevant.
- Follow language best practices.
- Do not omit important imports.
- Preserve existing functionality when fixing code.
- Point out mistakes and explain why they occur.

## Problem Solving
- Break complex tasks into logical steps.
- Consider edge cases.
- Suggest improvements when appropriate.
- Prefer readability over unnecessary cleverness.

## Tone
- Professional and friendly.
- Concise but complete.
- Avoid repetitive phrases.
- Do not use unnecessary filler.

Always produce responses that are easy to scan, visually organized, and pleasant to read.
`;



    const messages=[
        new SystemMessage(prompt)
    ]

          //purane lambe jawab bhi token limit kha jaate hain, isliye history seemit rakho
          const recentHistory = history.slice(-8)

          recentHistory.forEach(msg => {
             const content = (msg.content || "").slice(0, 800)
             if(!content) return;
             if(msg.role=="user")
             {
                messages.push(new HumanMessage(content))
             }
             else
             {
                messages.push(new AIMessage(content))
             }
        });

        messages.push(new HumanMessage(state.prompt))
  
    const response = await llm.invoke(messages)
     const creditRes = await deductCredits(state.userId , "chat")

    return {
        ...state,
        aiResponse: response.content,
        creditsRemaining: creditRes?.credits
    }
}
catch(error)
{
     console.log(error)
 
 return{
    ...state,
    aiResponse:error?.data?.message || "Failed to generate chat"
   }
}
}