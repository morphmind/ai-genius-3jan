import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SocialPlatform, ReelsIdea } from "../types";
import { socialMediaService } from "../services/socialMediaService";
import { parseReelsResponse } from "../utils/reelsParser";

const STORAGE_KEY = "reels_idea_history";

export const useSocialMedia = () => {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ReelsIdea[]>([]);
  const [ideaHistory, setIdeaHistory] = useState<ReelsIdea[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { toast } = useToast();

  // localStorage'a kaydet
  const saveToHistory = (newIdeas: ReelsIdea[]) => {
    try {
      const updatedHistory = [...newIdeas, ...ideaHistory];
      setIdeaHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        const reducedHistory = ideaHistory.slice(0, -1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedHistory));
        setIdeaHistory(reducedHistory);
      }
    }
  };

  // Fikir silme
  const deleteIdea = (id: string) => {
    const newHistory = ideaHistory.filter(idea => idea.id !== id);
    setIdeaHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const generateIdeas = async (platform: SocialPlatform, topic: string) => {
    if (!topic.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir konu girin",
        variant: "destructive"
      });
      return;
    }

    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast({
        title: "API Anahtarı Gerekli",
        description: "Lütfen OpenAI API anahtarınızı ayarlarda belirtin",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      switch (platform) {
        case "instagram_reels": {
          const { gpt4Response, gpt35Response } = await socialMediaService.generateReelsIdeas(topic, apiKey);
          const newIdeas = [
            ...parseReelsResponse(gpt4Response),
            ...parseReelsResponse(gpt35Response)
          ];
          setIdeas(newIdeas);
          saveToHistory(newIdeas); // Yeni fikirleri geçmişe kaydet
          break;
        }
        // Add other platform cases here
        default:
          setIdeas([]);
      }
    } catch (error) {
      console.error("Content generation error:", error);
      toast({
        title: "Hata",
        description: "İçerik fikirleri üretilirken bir hata oluştu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    ideas,
    ideaHistory,
    generateIdeas,
    deleteIdea
  };
};
