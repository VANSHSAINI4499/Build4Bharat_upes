const SENTENCE_REGEX = /[^.!?]+[.!?]+|[^.!?]+$/g;

export const splitIntoSentences = (text) => {
    return (text.match(SENTENCE_REGEX) || []).map((sentence) => sentence.trim()).filter(Boolean);
};

export const chunkTextBySentenceCount = (text, sentenceCount = 5) => {
    const sentences = splitIntoSentences(text);

    if (!sentences.length) {
        return text.trim() ? [text.trim()] : [];
    }

    const chunks = [];

    for (let i = 0; i < sentences.length; i += sentenceCount) {
        chunks.push(sentences.slice(i, i + sentenceCount).join(' '));
    }

    return chunks;
};
