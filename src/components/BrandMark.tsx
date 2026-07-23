type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "h-8 w-8" }: BrandMarkProps) {
  return (
    <img
      src="/smartinvest-logo.png"
      alt=""
      aria-hidden="true"
      className={`inline-block shrink-0 object-contain ${className}`}
    />
  );
}