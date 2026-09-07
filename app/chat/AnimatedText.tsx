export default function AnimatedText({ text }: { text: string }) {
  // Keep complete text available to selection, screen readers and chat history.
  // Grapheme boundaries preserve emoji and combined characters during the reveal.
  const characters = Array.from(
    new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text),
    ({ segment }) => segment,
  );
  const interval = Math.min(18, 2200 / Math.max(characters.length, 1));

  return (
    <span className="answer-reveal">
      {characters.map((character, index) => (
        <span key={index} style={{ animationDelay: `${80 + index * interval}ms` }}>
          {character}
        </span>
      ))}
    </span>
  );
}
