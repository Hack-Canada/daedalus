type Props = {};

const ResetPasswordHeader = ({}: Props) => {
  return (
    <div className="space-y-1">
      <h1 className="font-display text-4xl text-white md:text-5xl">
        Reset Password
      </h1>
      <p className="text-white/60 text-sm md:text-base">
        Please enter your new password.
      </p>
    </div>
  );
};

export default ResetPasswordHeader;
