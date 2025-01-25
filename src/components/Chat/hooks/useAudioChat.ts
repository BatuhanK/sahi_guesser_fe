import {
  createLocalAudioTrack,
  LocalAudioTrack,
  RemoteParticipant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import { authApi } from "../../../services/api";
import { soundService } from "../../../services/soundService";
import { AudioState, RemoteParticipantState } from "../types";
import { initializeIOSAudio, isIOS } from "../utils";

export const useAudioChat = (roomId: string | null, userId: string | null) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isConnected: false,
    isConnecting: false,
    room: null,
    error: null,
    isMuted: false,
    isRoomMuted: false,
    listeners: new Set<string>(),
  });

  const [remoteParticipants, setRemoteParticipants] = useState<
    Map<string, RemoteParticipantState>
  >(new Map());

  let livekitRoom: Room | null = null;

  const connectToLiveKit = async () => {
    try {
      if (!userId) {
        alert("Lütfen giriş yapınız.");
        return;
      }
      if (!roomId) {
        alert("Oda bulunamadı.");
        return;
      }


      if (isIOS) {
        initializeIOSAudio();
      }

      setAudioState((prev) => ({ ...prev, isConnecting: true, error: null }));

      const token = await authApi.getLiveKitToken(roomId.toString());

      livekitRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      setupRoomEventListeners(livekitRoom);

      await livekitRoom.connect("https://aws-livekit.sahikaca.com", token);

      const audioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      });
      await livekitRoom.localParticipant.publishTrack(audioTrack);

      soundService.setVolume(0.05);

      setAudioState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        room: livekitRoom,
      }));
    } catch (error) {
      console.error("Failed to connect to LiveKit:", error);
      setAudioState((prev) => ({
        ...prev,
        isConnecting: false,
        error: "Ses bağlantısı kurulamadı",
      }));
    }
  };

  const setupRoomEventListeners = (room: Room) => {
    room.on(RoomEvent.Disconnected, () => {
      setAudioState((prev) => ({
        ...prev,
        isConnected: false,
        room: null,
      }));
    });

    room.on(RoomEvent.LocalTrackPublished, async (trackPublication) => {
      if (
        trackPublication.source === Track.Source.Microphone &&
        trackPublication.track instanceof LocalAudioTrack
      ) {
        console.log('Local audio track published with native noise suppression and echo cancellation');
      }
    });

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log("Participant connected:", participant.identity);

      // Check if participant was previously muted
      const mutedParticipants = getMutedParticipants();
      const wasPreviouslyMuted = mutedParticipants.has(participant.identity);

      // Add to listeners and set initial mute state if room is muted or was previously muted
      setAudioState((prev) => ({
        ...prev,
        listeners: new Set([...prev.listeners, participant.identity]),
      }));

      // Always add participant to remote participants with initial mute state
      setRemoteParticipants((prev) => {
        setAudioState((currentState) => {
          const updated = new Map(prev);
          updated.set(participant.identity, {
            identity: participant.identity,
            audioTrack: null,
            isMuted: currentState.isRoomMuted || wasPreviouslyMuted,
            isSpeaking: false,
          });
          return currentState;
        });
        return prev;
      });
    });

    room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, _publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          // Get the current room mute state and check if participant was previously muted
          setAudioState((prev) => {
            const mutedParticipants = getMutedParticipants();
            const wasPreviouslyMuted = mutedParticipants.has(
              participant.identity
            );

            // Immediately apply room mute state or previous mute state to the new track
            track.mediaStreamTrack.enabled = !(
              prev.isRoomMuted || wasPreviouslyMuted
            );

            const newListeners = new Set(prev.listeners);
            newListeners.delete(participant.identity);

            // Update remote participants with the latest mute state
            setRemoteParticipants((participantsPrev) => {
              const updated = new Map(participantsPrev);
              updated.set(participant.identity, {
                identity: participant.identity,
                audioTrack: track,
                isMuted: prev.isRoomMuted || wasPreviouslyMuted,
                isSpeaking: false,
              });
              return updated;
            });

            return { ...prev, listeners: newListeners };
          });

          // Then set up the audio elements and monitoring
          const mediaTrack = track.mediaStreamTrack;
          const audioElement = new Audio();

          if (isIOS) {
            audioElement.setAttribute("playsinline", "true");
            audioElement.muted = false;
          }

          const mediaStream = new MediaStream([mediaTrack]);
          audioElement.srcObject = mediaStream;
          audioElement.play().catch(console.error);

          setupAudioLevelMonitoring(mediaStream, participant);
        }
      }
    );

    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach();
      }
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      setRemoteParticipants((prev) => {
        const updated = new Map(prev);
        updated.delete(participant.identity);
        return updated;
      });
      setAudioState((prev) => {
        const newListeners = new Set(prev.listeners);
        newListeners.delete(participant.identity);
        return { ...prev, listeners: newListeners };
      });
    });
  };

  const setupAudioLevelMonitoring = (
    mediaStream: MediaStream,
    participant: RemoteParticipant
  ) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let speakingTimeout: NodeJS.Timeout;

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      setRemoteParticipants((prev) => {
        const updated = new Map(prev);
        const participantIdentity = participant.identity;
        const currentParticipant = updated.get(participantIdentity);
        if (currentParticipant) {
          const isSpeaking = average > 30;
          if (isSpeaking !== currentParticipant.isSpeaking) {
            clearTimeout(speakingTimeout);
            if (isSpeaking) {
              speakingTimeout = setTimeout(() => {
                setRemoteParticipants((prev) => {
                  const updated = new Map(prev);
                  const currentParticipant = updated.get(participantIdentity);
                  if (currentParticipant) {
                    updated.set(participantIdentity, {
                      ...currentParticipant,
                      isSpeaking: false,
                    });
                  }
                  return updated;
                });
              }, 500);
            }
            updated.set(participantIdentity, {
              ...currentParticipant,
              isSpeaking,
            });
          }
        }
        return updated;
      });

      requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  };

  const disconnectFromLiveKit = async () => {
    try {
      if (audioState.room) {
        const localParticipant = audioState.room.localParticipant;
        const tracks = Array.from(localParticipant.trackPublications.values());

        // Stop all tracks
        tracks.forEach((publication) => {
          if (publication.track) {
            publication.track.stop();
            localParticipant.unpublishTrack(publication.track);
          }
        });

        soundService.setVolume(0.05);

        // Disconnect from room
        await audioState.room.disconnect(true);

        // Reset state
        setAudioState((prev) => ({
          ...prev,
          isConnected: false,
          room: null,
          isMuted: false,
          isRoomMuted: false,
        }));

        // Clear participants
        setRemoteParticipants(new Map());
      } else if (livekitRoom) {
        await livekitRoom.disconnect(true);
      }
    } catch (error) {
      console.error("Error disconnecting from LiveKit:", error);
    }
  };

  const toggleMute = useCallback(() => {
    if (audioState.room) {
      const localParticipant = audioState.room.localParticipant;
      const audioTracks = Array.from(
        localParticipant.trackPublications.values()
      ).filter((pub) => pub.kind === Track.Kind.Audio);

      audioTracks.forEach((publication) => {
        if (publication.track) {
          publication.track.mediaStreamTrack.enabled =
            !publication.track.mediaStreamTrack.enabled;
        }
      });

      setAudioState((prev) => ({
        ...prev,
        isMuted: !prev.isMuted,
      }));
    }
  }, [audioState.room]);

  const toggleRoomMute = useCallback(() => {
    const newRoomMutedState = !audioState.isRoomMuted;

    // First update the state
    setAudioState((prev) => ({
      ...prev,
      isRoomMuted: newRoomMutedState,
    }));

    // Then apply to all participants
    setRemoteParticipants((prev) => {
      const updated = new Map(prev);
      prev.forEach((participant, id) => {
        if (participant.audioTrack) {
          // Directly control the MediaStreamTrack's enabled state
          participant.audioTrack.mediaStreamTrack.enabled = !newRoomMutedState;
          updated.set(id, {
            ...participant,
            isMuted: newRoomMutedState,
          });
        }
      });
      return updated;
    });
  }, [audioState.isRoomMuted]);

  const MUTED_PARTICIPANTS_KEY = "muted_participants";

  const getMutedParticipants = (): Set<string> => {
    const stored = localStorage.getItem(MUTED_PARTICIPANTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  };

  const addMutedParticipant = (participantId: string) => {
    const muted = getMutedParticipants();
    muted.add(participantId);
    localStorage.setItem(MUTED_PARTICIPANTS_KEY, JSON.stringify([...muted]));
  };

  const removeMutedParticipant = (participantId: string) => {
    const muted = getMutedParticipants();
    muted.delete(participantId);
    localStorage.setItem(MUTED_PARTICIPANTS_KEY, JSON.stringify([...muted]));
  };

  const toggleParticipantMute = (participantId: string) => {
    setRemoteParticipants((prev) => {
      const updated = new Map(prev);
      const participant = updated.get(participantId);
      if (participant && participant.audioTrack) {
        const newMutedState = !participant.isMuted;
        participant.audioTrack.mediaStreamTrack.enabled = !newMutedState;
        updated.set(participantId, {
          ...participant,
          isMuted: newMutedState,
        });

        // Persist mute state in local storage
        if (newMutedState) {
          addMutedParticipant(participantId);
        } else {
          removeMutedParticipant(participantId);
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    return () => {
      disconnectFromLiveKit();
    };
  }, []);

  useEffect(() => {
    if (audioState.isConnected) {
      disconnectFromLiveKit();
    }
  }, [roomId]);

  return {
    audioState,
    remoteParticipants,
    connectToLiveKit,
    disconnectFromLiveKit,
    toggleMute,
    toggleRoomMute,
    toggleParticipantMute,
  };
};

