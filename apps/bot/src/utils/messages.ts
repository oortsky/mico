const ERROR_VARIATIONS = [
  "Oops, couldn't {action}.",
  "Something went wrong while trying to {action}.",
  "Uh-oh, failed to {action}.",
  "Looks like I couldn't {action}.",
  "Welp, I couldn't {action}."
];

export function errorMessage(action: string) {
  const random =
    ERROR_VARIATIONS[Math.floor(Math.random() * ERROR_VARIATIONS.length)];

  return `❌ ${random.replace("{action}", action)}`;
}

const EMPTY_QUESTION_MESSAGES = [
  "Ask me something first.",
  "You forgot the question.",
  "Bro, where's the question?",
  "I'm waiting for your question 👀",
  "Type a question first."
];

export function emptyQuestionMessage() {
  return `❌ ${
    EMPTY_QUESTION_MESSAGES[
      Math.floor(Math.random() * EMPTY_QUESTION_MESSAGES.length)
    ]
  }`;
}