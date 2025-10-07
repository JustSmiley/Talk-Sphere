import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
];

const LanguageSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatType = searchParams.get("type") || "text";
  const topic = searchParams.get("topic") || "";
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [anyLanguage, setAnyLanguage] = useState(false);

  const toggleLanguage = (code: string) => {
    if (anyLanguage) {
      // In translator mode, only allow 1 language
      setSelectedLanguages([code]);
    } else {
      if (selectedLanguages.includes(code)) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== code));
      } else if (selectedLanguages.length < 3) {
        setSelectedLanguages([...selectedLanguages, code]);
      }
    }
  };

  const handleTranslatorToggle = () => {
    const newAnyLanguage = !anyLanguage;
    setAnyLanguage(newAnyLanguage);
    // Clear selections when toggling
    setSelectedLanguages([]);
  };

  const handleContinue = () => {
    if (selectedLanguages.length > 0 || anyLanguage) {
      const langs = anyLanguage ? "any" : selectedLanguages.join(",");
      navigate(`/verification?type=${chatType}&topic=${topic}&languages=${langs}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Step 2 of 3
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {anyLanguage ? "Select Translation Language" : "Select Languages"}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {anyLanguage 
                ? "Choose 1 language to translate conversations into"
                : chatType === "text" 
                  ? "Choose up to 3 preferred languages or use translator" 
                  : "Choose up to 3 preferred languages"
              }
            </p>
            {!anyLanguage && (
              <p className="text-sm text-muted-foreground">
                {selectedLanguages.length}/3 selected
              </p>
            )}
            {anyLanguage && selectedLanguages.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedLanguages.length}/1 selected
              </p>
            )}
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => toggleLanguage(language.code)}
                disabled={
                  anyLanguage 
                    ? false 
                    : (!selectedLanguages.includes(language.code) && selectedLanguages.length >= 3)
                }
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative ${
                  selectedLanguages.includes(language.code)
                    ? "border-primary bg-card shadow-lg shadow-primary/20"
                    : "border-border bg-card/50 hover:border-primary/50"
                }`}
              >
                <div className="text-4xl mb-2">{language.flag}</div>
                <div className="text-sm font-semibold text-foreground">{language.name}</div>
                <div className="h-6 mt-2">
                  {selectedLanguages.includes(language.code) && (
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Text Chat Option */}
          {chatType === "text" && (
            <div className="bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-6 mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anyLanguage}
                  onChange={handleTranslatorToggle}
                  className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-semibold text-foreground">Use Translator (Any Language)</div>
                  <div className="text-sm text-muted-foreground">
                    Enable real-time translation instead of selecting specific languages
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={handleContinue}
              disabled={selectedLanguages.length === 0 && !anyLanguage}
              className="min-w-[280px]"
            >
              Continue to Verification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
