import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Trophy, Heart, Palette, Code, Music, Globe, Search, MessageCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const topics = [
  { id: "general", name: "General", icon: MessageCircle, color: "from-slate-500 to-gray-500", description: "Just talk to people!" },
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
  const [trendingTopics, setTrendingTopics] = useState<Array<{ topic: string; count: number }>>([]);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        // Get topics from recent match queue entries (last 24 hours)
        const { data: queueData, error: queueError } = await supabase
          .from("match_queue")
          .select("topic")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Get topics from recent chat sessions (last 24 hours)
        const { data: sessionData, error: sessionError } = await supabase
          .from("chat_sessions")
          .select("topic")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!queueError && !sessionError) {
          // Combine and count topics
          const allTopics = [...(queueData || []), ...(sessionData || [])];
          const topicCounts = allTopics.reduce((acc, { topic }) => {
            acc[topic] = (acc[topic] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Sort by count and get top 3
          const sorted = Object.entries(topicCounts)
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          setTrendingTopics(sorted);
        }
      } catch (error) {
        console.error("Error fetching trending topics:", error);
      }
    };

    fetchTrendingTopics();
  }, []);

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
                  {topic.description && (
                    <p className="text-sm text-muted-foreground mt-2">{topic.description}</p>
                  )}
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
            {trendingTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map(({ topic }, index) => (
                  <button 
                    key={topic}
                    onClick={() => handleTopicSelect(topic)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors capitalize ${
                      index % 2 === 0 
                        ? "bg-primary/10 text-primary hover:bg-primary/20" 
                        : "bg-accent/10 text-accent hover:bg-accent/20"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trending topics yet. Be the first!</p>
            )}
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
