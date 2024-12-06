import { useState } from "react";
import { MentionState } from "../types";
import { fuzzySearch } from "../utils";
import { OnlinePlayer } from "../../../types/socket";

export const useMentions = (onlinePlayers: OnlinePlayer[]) => {
  const [mentionState, setMentionState] = useState<MentionState>({
    isActive: false,
    startPosition: 0,
    text: "",
  });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  const filteredPlayers = onlinePlayers.filter((player) =>
    mentionState.isActive ? fuzzySearch(player.username, mentionState.text) : false
  );

  const handleMentionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    message: string,
    setMessage: (message: string) => void,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    if (!mentionState.isActive) return;

    switch (e.key) {
      case "Tab":
      case "Enter":
        if (filteredPlayers.length > 0) {
          e.preventDefault();
          completeMention(
            filteredPlayers[selectedMentionIndex].username,
            message,
            setMessage,
            inputRef
          );
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          Math.min(prev + 1, filteredPlayers.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedMentionIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Escape":
        setMentionState({ isActive: false, startPosition: 0, text: "" });
        break;
    }
  };

  const handleMentionInput = (
    newValue: string,
    cursorPosition: number
  ) => {
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");
    const lastSpaceBeforeAt = textBeforeCursor.lastIndexOf(" ", lastAtSymbol);

    if (
      lastAtSymbol !== -1 &&
      (lastSpaceBeforeAt === -1 || lastSpaceBeforeAt < lastAtSymbol) &&
      cursorPosition > lastAtSymbol
    ) {
      const mentionText = textBeforeCursor.slice(lastAtSymbol + 1);
      setMentionState({
        isActive: true,
        startPosition: lastAtSymbol,
        text: mentionText,
      });
      setSelectedMentionIndex(0);
    } else {
      setMentionState({ isActive: false, startPosition: 0, text: "" });
    }
  };

  const completeMention = (
    username: string,
    message: string,
    setMessage: (message: string) => void,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    const beforeMention = message.slice(0, mentionState.startPosition);
    const afterMention = message.slice(
      mentionState.startPosition + mentionState.text.length + 1
    );
    const newMessage = `${beforeMention}@${username} ${afterMention}`;

    setMessage(newMessage);
    setMentionState({ isActive: false, startPosition: 0, text: "" });
    setSelectedMentionIndex(0);

    const newPosition = mentionState.startPosition + username.length + 2;
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newPosition, newPosition);
        inputRef.current.focus();
      }
    }, 0);
  };

  return {
    mentionState,
    selectedMentionIndex,
    filteredPlayers,
    handleMentionKeyDown,
    handleMentionInput,
    completeMention,
  };
}; 