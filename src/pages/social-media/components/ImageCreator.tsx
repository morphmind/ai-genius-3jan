import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Platform = "instagram" | "twitter" | "facebook" | "linkedin" | "whatsapp";
type Orientation = "horizontal" | "vertical";

const PLATFORMS = [
  { id: "instagram", name: "Instagram" },
  { id: "twitter", name: "Twitter" },
  { id: "facebook", name: "Facebook" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "whatsapp", name: "WhatsApp" }
];

const IMAGE_SIZES = {
  instagram: {
    horizontal: { width: 1080, height: 566 },
    vertical: { width: 1080, height: 1350 }
  },
  twitter: {
    horizontal: { width: 1200, height: 675 },
    vertical: { width: 1080, height: 1350 }
  },
  facebook: {
    horizontal: { width: 1200, height: 630 },
    vertical: { width: 1080, height: 1350 }
  },
  linkedin: {
    horizontal: { width: 1200, height: 627 },
    vertical: { width: 1080, height: 1350 }
  },
  whatsapp: {
    horizontal: { width: 800, height: 418 },
    vertical: { width: 800, height: 1000 }
  }
};

export function ImageCreator() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir konu girin",
        variant: "destructive"
      });
      return;
    }

    const apiKey = localStorage.getItem("recraft_api_key");
    if (!apiKey) {
      toast({
        title: "API Anahtarı Gerekli",
        description: "Lütfen Recraft API anahtarınızı ayarlarda belirtin",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const size = IMAGE_SIZES[platform][orientation];
      const response = await fetch("https://api.recraft.ai/v2/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: `Create a ${orientation} image for ${platform} about: ${topic}. Professional quality, modern design.`,
          negative_prompt: "text, words, letters, numbers, watermark",
          model: "recraft-v2",
          width: size.width,
          height: size.height,
          steps: 30,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
          scheduler: "dpm++2m-karras",
          num_images: 1
        })
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const data = await response.json();
      setImageUrl(data.images[0]?.url);
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Hata",
        description: "Görsel oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${platform}_${orientation}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Hata",
        description: "Görsel indirilemedi",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(value: Platform) => setPlatform(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Platform seçin" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Görsel Yönü</Label>
              <Tabs value={orientation} onValueChange={(value: Orientation) => setOrientation(value)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="horizontal">Yatay</TabsTrigger>
                  <TabsTrigger value="vertical">Dikey</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Konu</Label>
            <Input
              placeholder="Görsel konusunu girin..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <Button 
            className="w-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Görsel Oluşturuluyor...
              </>
            ) : (
              "Görsel Oluştur"
            )}
          </Button>
        </CardContent>
      </Card>

      {imageUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <img
                src={imageUrl}
                alt="Generated content"
                className="w-full rounded-lg"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Görseli İndir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
