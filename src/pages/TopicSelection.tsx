import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Trophy, Heart, Palette, Code, Music, Globe, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const topics = [
  { id: "tech", name: "Technology", icon: Code, color: "from-blue-500 to-cyan-500" },
  { id: "sports", name: "Sports", icon: Trophy, color: "from-green-500 to-emerald-500" },
  { id: "health", name: "Mental Health", icon: Heart, color: "from-pink-500 to-rose-500" },
  { id: "art", name: "Art & Design", icon: Palette, color: "from-purple-500 to-violet-500" },
  { id: "music", name: "Music", icon: Music, color: "from-orange-500 to-amber-500" },
  { id: "culture", name: "Culture", icon: Globe, color: "from-indigo-500 to-blue-500" },
];

const TopicSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatType = searchParams.get("type") || "text";
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setCustomTopic("");
  };

  const handleCustomTopicSelect = () => {
    if (customTopic.trim()) {
      setSelectedTopic(customTopic.trim());
    }
  };

  const handleContinue = () => {
    if (selectedTopic) {
      navigate(`/language-selection?type=${chatType}&topic=${selectedTopic}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Step 1 of 3
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Choose Your Topic
            </h1>
            <p className="text-lg text-muted-foreground">
              Select a category to connect with like-minded people
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="pl-10 bg-card"
            />
          </div>

          {/* Custom Topic Input */}
          <div className="mb-6">
            <Input
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedTopic(e.target.value.trim());
                }
              }}
              placeholder="Or enter your own topic..."
              className="bg-card"
            />
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    selectedTopic === topic.id
                      ? "border-primary bg-card shadow-lg shadow-primary/20"
                      : "border-border bg-card/50 hover:border-primary/50"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{topic.name}</h3>
                </button>
              );
            })}
          </div>

          {/* Trending Section */}
          <div className="bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Trending Now</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleTopicSelect("ai-ml")}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
              >
                AI & Machine Learning
              </button>
              <button 
                onClick={() => handleTopicSelect("world-cup")}
                className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm hover:bg-accent/20 transition-colors"
              >
                World Cup 2026
              </button>
              <button 
                onClick={() => handleTopicSelect("digital-art")}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
              >
                Digital Art
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={handleContinue}
              disabled={!selectedTopic}
              className="min-w-[280px]"
            >
              Continue to Language Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;
