export const parseAIResult = (content: string) => {
  try {
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    const json = content.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(json);
  } catch (err) {
    throw new Error("Failed to parse AI JSON result.");
  }
};
