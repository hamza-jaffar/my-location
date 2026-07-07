function Skeleton({ w = "w-full", h = "h-5" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-neutral-100 rounded animate-pulse`} />;
}

export default Skeleton;