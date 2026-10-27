export default function AnimatedText({ text }: { text: string }) {
  // The complete answer stays selectable; CSS only animates the whole block.
  return <span className="answer-reveal">{text}</span>;
}
