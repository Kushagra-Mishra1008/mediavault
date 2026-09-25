// Static ambient backdrop: two soft color glows + a faint HUD grid that
// fades out toward the edges. Nothing here animates and it sits on its
// own fixed layer, so it never repaints while the page scrolls.
export default function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      <div className="absolute -top-40 -left-40 size-[42rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_46_85/0.13),transparent)]" />
      <div className="absolute -bottom-60 -right-40 size-[48rem] rounded-full bg-[radial-gradient(closest-side,rgb(56_217_245/0.08),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
        }}
      />
    </div>
  );
}
