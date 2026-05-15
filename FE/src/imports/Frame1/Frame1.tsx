import svgPaths from "./svg-e8zk52iizk";

export default function Frame() {
  return (
    <div className="bg-[rgba(60,60,67,0.6)] border border-black border-solid relative size-full">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex h-[540px] items-center justify-center left-1/2 top-1/2 w-[660px]">
        <div className="flex-none rotate-180">
          <div className="h-[540px] relative w-[660px]">
            <div className="absolute inset-[0_-0.61%_-1.48%_-0.61%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 668 548">
                <g filter="url(#filter0_d_1_20)" id="Rectangle 1">
                  <path d={svgPaths.p3dc8e200} fill="#FF2D55" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="548" id="filter0_d_1_20" width="668" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_20" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_20" mode="normal" result="shape" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Glory:Regular',sans-serif] font-normal h-[68px] justify-center leading-[0] left-1/2 text-[64px] text-center text-white top-[calc(50%-191px)] w-[518px]">
        <p className="leading-[normal]">WELCOME BACK</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Glory:Regular',sans-serif] font-normal h-[53px] justify-center leading-[0] left-[718.5px] text-[24px] text-center text-white top-[356.5px] w-[385px]">
        <p className="leading-[normal]">Login to continue exploring movies</p>
      </div>
    </div>
  );
}