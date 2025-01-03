import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentIdeas } from "./components/ContentIdeas";
import { ImageCreator } from "./components/ImageCreator";

const SocialMedia = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="content">İçerik Fikirleri</TabsTrigger>
          <TabsTrigger value="image">Görsel Oluşturucu</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <ContentIdeas />
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <ImageCreator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMedia;
