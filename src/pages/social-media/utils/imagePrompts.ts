import { SocialPlatform, ImageType } from "../types";

export const generateImagePrompt = (
  platform: SocialPlatform,
  type: ImageType,
  topic: string
): string => {
  const basePrompt = `Create a ${type === "story" ? "vertical" : "square"} image for ${platform.replace("_", " ")} about: ${topic}.\n\n`;
  
  const platformSpecifics = {
    instagram_reels: "Ensure the image is eye-catching and optimized for mobile viewing. Include space for text overlays.",
    instagram_story: "Design for vertical format with clear focal points. Consider interactive elements placement.",
    instagram_post: "Create a visually striking square composition that stands out in the feed.",
    twitter: "Design for high engagement with clear messaging and bold visuals.",
    linkedin: "Professional and polished design suitable for business audience."
  };

  const styleGuide = `
Style Guidelines:
- Use modern, trendy design elements
- Ensure text is readable
- Include branded elements if applicable
- Optimize contrast for mobile viewing
- Use appropriate color psychology
`;

  return `${basePrompt}${platformSpecifics[platform]}\n${styleGuide}`;
};
