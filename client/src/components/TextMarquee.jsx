export default function TextMarquee({
  items = ['MASTER THE BLUFF', 'RULE THE TEA STALL', 'TRUST NO ONE'],
  bgColor = '#2e8b57',
  textColor = '#f8f5e6'
}) {
  const repeated = [...items, ...items, ...items, ...items, ...items, ...items, ...items, ...items];

  return (
    <div
      className="overflow-hidden py-4 md:py-5 select-none border-y border-white/10"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="marquee-track flex whitespace-nowrap">
        {repeated.map((text, i) => (
          <span
            key={i}
            className="font-black text-lg md:text-2xl uppercase tracking-[0.15em] mx-6 md:mx-10 shrink-0"
          >
            {text}
            <span className="mx-6 md:mx-10 opacity-30">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
