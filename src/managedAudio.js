export function createManagedAudio({
  src,
  volume,
  registerAudioElement,
  onEnded,
}) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;

  const unregisterAudio = registerAudioElement(audio);
  audio.onended = onEnded;

  const cleanup = () => {
    audio.onended = null;
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    unregisterAudio?.();
  };

  return { audio, cleanup };
}
