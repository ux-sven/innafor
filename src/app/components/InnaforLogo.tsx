import logoSvg from '../../imports/INNAF_R_LOGO.svg';

export function InnaforLogo() {
  return (
    <div className="h-[184px] overflow-clip relative shrink-0 w-[380px]">
      <img
        src={logoSvg}
        alt="INNAFØR"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
