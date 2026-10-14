type Props = {};

const SignInHeader = ({}: Props) => {
  return (
    <div className="space-y-1">
      <h1 className="font-display text-4xl text-white md:text-5xl">
        Sign In
      </h1>
      <p className="text-sm text-white/60 md:text-base">
        to continue to Hack Canada
      </p>
      <p className="pt-2 text-xs text-white/40">Last year&apos;s login still works.</p>
    </div>
  );
};

export default SignInHeader;
