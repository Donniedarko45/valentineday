"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CardCustomizer from "./components/CardCustomizer";
import CompatibilityQuiz from "./components/CompatibilityQuiz";
import HeartBackground from "./components/HeartBackground";
import SocialShare from "./components/SocialShare";
import ValentineCard from "./components/ValentineCard";

export default function Home() {
  const [formData, setFormData] = useState({
    senderUsername: "",
    partnerUsername: "",
    platform: "instagram" as "instagram" | "x",
  });
  const [showCard, setShowCard] = useState(false);
  const [flirtMessage, setFlirtMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileImages, setProfileImages] = useState({
    sender: "",
    partner: "",
  });
  const [matchHistory, setMatchHistory] = useState<
    Array<{
      senderUsername: string;
      partnerUsername: string;
      platform: "instagram" | "x";
      matchPercentage: number;
      flirtMessage: string;
      senderImage: string;
      partnerImage: string;
      date: string;
    }>
  >([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentTheme, setCurrentTheme] = useState({
    id: "default",
    name: "Classic Romance",
    background: "#1a0010",
    foreground: "#ff9ecd",
    accent: "#ff1493",
  });
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  const generateFlirtMessage = async () => {
    try {
      const response = await fetch("/api/generate-flirt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderUsername: formData.senderUsername,
          partnerUsername: formData.partnerUsername,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        throw new Error(errorData.error || "Failed to generate message");
      }

      const data = await response.json();
      if (!data.message) {
        throw new Error("No message received");
      }

      return data.message;
    } catch (error) {
      console.error("Failed to generate message:", error);
      return `Hey ${formData.partnerUsername}! You make my heart skip a beat! 💕 Will you be my Valentine?`;
    }
  };

  const getInitialsAvatar = (username: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=ff69b4&color=fff&size=400`;
  };

  const fetchProfileImage = async (username: string) => {
    try {
      console.log(`Fetching profile for ${username} on platform ${formData.platform}`);

      const response = await fetch("/api/fetch-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.replace("@", ""),
          platform: formData.platform,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error fetching ${username}'s profile:`, errorData);
        return getInitialsAvatar(username); // Return generated avatar on error
      }

      const data = await response.json();
      console.log(`Profile data for ${username}:`, data);

      if (!data.imageUrl) {
        console.error(`No image URL returned for ${username}`);
        return getInitialsAvatar(username); // Return generated avatar if no image URL
      }

      return data.imageUrl;
    } catch (error) {
      console.error(`Error fetching ${username}'s profile image:`, error);
      return getInitialsAvatar(username); // Return generated avatar on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Starting profile fetches...");
      const [message, senderImage, partnerImage] = await Promise.all([
        generateFlirtMessage(),
        fetchProfileImage(formData.senderUsername),
        fetchProfileImage(formData.partnerUsername),
      ]);

      console.log("Profile fetch results:", {
        senderImage,
        partnerImage,
      });

      const matchData = {
        senderUsername: formData.senderUsername,
        partnerUsername: formData.partnerUsername,
        platform: formData.platform,
        matchPercentage: getRandomMatch(),
        flirtMessage: message,
        senderImage: senderImage || "",
        partnerImage: partnerImage || "",
        date: new Date().toISOString(),
      };

      // Save to localStorage
      const existingHistory = JSON.parse(
        localStorage.getItem("matchHistory") || "[]",
      );
      const updatedHistory = [matchData, ...existingHistory].slice(0, 10); // Keep last 10 matches
      localStorage.setItem("matchHistory", JSON.stringify(updatedHistory));
      setMatchHistory(updatedHistory);

      setFlirtMessage(message);
      setProfileImages({
        sender: senderImage || "",
        partner: partnerImage || "",
      });
      setShowCard(true);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomMatch = () => {
    return Math.floor(Math.random() * 31) + 70;
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("matchHistory");
    if (savedHistory) {
      setMatchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    setShowQuiz(false);
    handleSubmit(new Event("submit") as any);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: currentTheme.background,
        color: currentTheme.foreground,
      }}
    >
      <HeartBackground />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {!showCard ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1
                className="text-4xl md:text-6xl font-bold"
                style={{ color: currentTheme.accent }}
              >
                Valentine's Match Generator
              </h1>
              <p className="text-xl opacity-80">
                Create your perfect Valentine's match card and share the love!
                💝
              </p>
            </div>

            {showQuiz ? (
              <CompatibilityQuiz onComplete={handleQuizComplete} />
            ) : (
              <>
                {/* Form Section */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowQuiz(true);
                  }}
                  className="bg-pink-950/30 backdrop-blur-sm rounded-xl p-6 md:p-8 space-y-6 border border-pink-500/20"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-pink-200">
                        Your Username
                      </label>
                      <input
                        type="text"
                        value={formData.senderUsername}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            senderUsername: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded bg-pink-950/30 border border-pink-500/30 focus:ring-2 focus:ring-pink-500/50 text-pink-100"
                        placeholder="@username"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-pink-200">
                        Partner's Username
                      </label>
                      <input
                        type="text"
                        value={formData.partnerUsername}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            partnerUsername: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded bg-pink-950/30 border border-pink-500/30 focus:ring-2 focus:ring-pink-500/50 text-pink-100"
                        placeholder="@username"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-pink-200">
                      Platform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          platform: e.target.value as "instagram" | "x",
                        })
                      }
                      className="w-full p-2 rounded bg-pink-950/30 border border-pink-500/30 focus:ring-2 focus:ring-pink-500/50 text-pink-100"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="x">X (Twitter)</option>
                    </select>
                  </div>

                  {/* Add Customization Section */}
                  <CardCustomizer
                    onThemeChange={setCurrentTheme}
                    onStickersChange={setSelectedStickers}
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-200 
                             disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    style={{ background: currentTheme.accent }}
                  >
                    {isLoading
                      ? "Generating Love Match..."
                      : "Start Compatibility Quiz"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ValentineCard
              senderUsername={formData.senderUsername}
              partnerUsername={formData.partnerUsername}
              platform={formData.platform}
              matchPercentage={quizScore || getRandomMatch()}
              flirtMessage={flirtMessage}
              senderImage={profileImages.sender}
              partnerImage={profileImages.partner}
              theme={currentTheme}
              stickers={selectedStickers}
            />

            <SocialShare
              flirtMessage={flirtMessage}
              matchPercentage={quizScore || getRandomMatch()}
              senderUsername={formData.senderUsername}
              partnerUsername={formData.partnerUsername}
            />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => {
                setShowCard(false);
                setShowQuiz(false);
                setQuizScore(null);
              }}
              className="mt-6 w-full py-3 px-4 rounded-lg hover:opacity-90 transition-colors"
              style={{ background: currentTheme.accent }}
            >
              Create Another Card
            </motion.button>
          </motion.div>
        )}

        {/* Match History Section */}
        {matchHistory.length > 0 && !showCard && !showQuiz && (
          <div className="mt-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: currentTheme.accent }}
            >
              Your Previous Matches
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {matchHistory.map((match, index) => (
                <motion.div
                  key={match.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-pink-950/30 backdrop-blur-sm rounded-xl p-4 border border-pink-500/20 
                           cursor-pointer hover:border-pink-500/40 transition-all"
                  onClick={() => {
                    setFormData({
                      senderUsername: match.senderUsername,
                      partnerUsername: match.partnerUsername,
                      platform: match.platform,
                    });
                    setFlirtMessage(match.flirtMessage);
                    setProfileImages({
                      sender: match.senderImage,
                      partner: match.partnerImage,
                    });
                    setShowCard(true);
                  }}
                >
                  {/* ... Match history card content ... */}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
