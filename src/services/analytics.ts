import ReactGA from "react-ga4";

class AnalyticsService {
  private initialized = false;

  initialize(measurementId: string) {
    if (this.initialized) return;
    ReactGA.initialize(measurementId);
    this.initialized = true;
  }

  // Page Views
  trackPageView(path: string) {
    ReactGA.send({ hitType: "pageview", page: path });
  }

  // Game Events
  trackGameStart(roomId: string) {
    ReactGA.event("game_start", {
      room_id: roomId,
    });
  }

  trackRoundStart(listingId: string, listingType: string) {
    ReactGA.event("round_start", {
      listing_id: listingId,
      listing_type: listingType,
    });
  }

  trackGuess(listingId: string, isCorrect: boolean, guessCount: number) {
    ReactGA.event("guess_attempt", {
      listing_id: listingId,
      is_correct: isCorrect,
      guess_count: guessCount,
    });
  }

  trackRoundEnd(listingId: string, userScore: number) {
    ReactGA.event("round_end", {
      listing_id: listingId,
      user_score: userScore,
    });
  }

  trackGameEnd(finalScore: number, totalRounds: number) {
    ReactGA.event("game_end", {
      final_score: finalScore,
      total_rounds: totalRounds,
    });
  }

  // User Events
  trackLogin(method: "regular" | "guest") {
    ReactGA.event("login", {
      method: method,
    });
  }

  trackRegistration() {
    ReactGA.event("sign_up");
  }

  // Chat Events
  trackChatMessage(roomId: string) {
    ReactGA.event("chat_message_sent", {
      room_id: roomId,
    });
  }

  // UI Events
  trackThemeToggle(theme: "light" | "dark") {
    ReactGA.event("theme_change", {
      theme: theme,
    });
  }

  trackImageNavigation(listingId: string) {
    ReactGA.event("image_navigation", {
      listing_id: listingId,
    });
  }
}

export const analyticsService = new AnalyticsService();
