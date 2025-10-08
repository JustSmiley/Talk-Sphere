import { Button } from "@/components/ui/button";
import { MessageSquare, Video, Globe, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Globe className="w-9 h-9 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TalkSphere
            </h1>
          </div>

          {/* Tagline */}
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Connect Instantly. Talk Globally.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join live conversations with people from around the world in seconds. No sign-up, no barriers—just real human connections.
            </p>
          </div>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 mt-8">
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/topic-selection?type=video")}
              className="group"
            >
              <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Start Voice & Video Chat
            </Button>
            
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/topic-selection?type=text")}
              className="group"
            >
              <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Start Text Chat
            </Button>

            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/topic-selection?type=captcha")}
              className="group"
            >
              <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Start CAPTCHA Chat
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Instant Access"
              description="Connect in under 15 seconds. No sign-up required."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Global Reach"
              description="Multi-language support with real-time translation."
            />
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="Safe & Secure"
              description="Human verification and active moderation."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:scale-105">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Home;
