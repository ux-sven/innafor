import logoSvg from '../../imports/INNAF_R_LOGO.svg';

export function InnaforLogo() {
  return (
    <div className="h-[150px] sm:h-[184px] overflow-clip relative shrink-0 w-full max-w-[380px]">
      <img
        src={logoSvg}
        alt="INNAFØR"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
