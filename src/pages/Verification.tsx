import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Shield, CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const Verification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatType = searchParams.get("type") || "text";
  const topic = searchParams.get("topic") || "";
  const languages = searchParams.get("languages") || "";
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setVerified(true);
      setIsVerifying(false);
      // Auto-navigate after successful verification
      setTimeout(() => {
        navigate(`/matching?type=${chatType}&topic=${topic}&languages=${languages}`);
      }, 1000);
    }, 2000);
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
            Step 3 of 3
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Human Verification
            </h1>
            <p className="text-lg text-muted-foreground">
              {chatType === "video" || chatType === "voice"
                ? "Quick face detection to ensure you're human"
                : chatType === "captcha"
                ? "Complete CAPTCHA verification to continue"
                : "Complete a simple verification to continue"}
            </p>
          </div>

          {/* Verification Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            {!verified ? (
              <>
                {chatType === "video" || chatType === "voice" ? (
                  <div className="space-y-6">
                    {/* Camera Preview Placeholder */}
                    <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Camera preview will appear here</p>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-primary/10 rounded-xl p-4">
                      <h3 className="font-semibold text-foreground mb-2">Quick Instructions:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Make sure your face is clearly visible</li>
                        <li>• This verification takes just a few seconds</li>
                        <li>• No data is stored or recorded</li>
                      </ul>
                    </div>
                  </div>
                ) : chatType === "captcha" ? (
                  <div className="space-y-6">
                    {/* CAPTCHA Specific UI */}
                    <div className="aspect-[2/1] bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                      <p className="text-muted-foreground">CAPTCHA challenge will appear here</p>
                    </div>

                    <div className="bg-primary/10 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">
                        Solve the CAPTCHA to verify you're human. This ensures safe conversations for all users.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* CAPTCHA Placeholder */}
                    <div className="aspect-[2/1] bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                      <p className="text-muted-foreground">CAPTCHA verification will appear here</p>
                    </div>

                    <div className="bg-primary/10 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">
                        Complete the verification to ensure you're human. This helps keep TalkSphere safe for everyone.
                      </p>
                    </div>
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full mt-6"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Start Verification"
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Verification Complete!</h2>
                <p className="text-muted-foreground">Finding your match now...</p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              <Shield className="w-4 h-4 inline mr-1" />
              Your privacy is protected. No verification data is stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
