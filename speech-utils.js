export function findMongolianVoice(voices = []) {
  const mongolianVoices = (voices || []).filter((voice) => (voice.lang || "").toLowerCase().startsWith("mn"));
  if (!mongolianVoices.length) return null;

  const femaleHints = ["female", "woman", "эм", "эмэгтэй", "girl", "bolorma", "saraa", "anu", "naraa"];
  const femaleVoice = mongolianVoices.find((voice) => {
    const name = (voice.name || "").toLowerCase();
    return femaleHints.some((hint) => name.includes(hint));
  });

  return femaleVoice || mongolianVoices[0];
}

export function normalizeToastSpeechText(message = "") {
  return String(message || "").replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
}

export function getToastType(message = "", types = {}) {
  if (message === types.correct) return "success";
  if (message === types.incorrect) return "fail";
  if (message === types.hint) return "hint";
  return "unknown";
}

export function speakMongolianText({
  text,
  voices = [],
  rate = 1,
  cancelFirst = false,
  speechSynthesisRef = globalThis?.speechSynthesis,
  utteranceFactory = (value) => new SpeechSynthesisUtterance(value),
  configureUtterance = null,
}) {
  if (!text || !speechSynthesisRef || typeof utteranceFactory !== "function") return null;

  if (cancelFirst && typeof speechSynthesisRef.cancel === "function") {
    speechSynthesisRef.cancel();
  }

  const voice = findMongolianVoice(voices);
  if (!voice) return null;

  const utterance = utteranceFactory(text);
  utterance.lang = voice.lang || "mn-MN";
  utterance.voice = voice;
  utterance.rate = rate;
  utterance.pitch = 1;

  if (typeof configureUtterance === "function") {
    configureUtterance(utterance, voice);
  }

  if (typeof speechSynthesisRef.speak === "function") {
    speechSynthesisRef.speak(utterance);
  }

  return { utterance, voice };
}
